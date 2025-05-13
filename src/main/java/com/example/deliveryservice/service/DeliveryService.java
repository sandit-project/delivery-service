package com.example.deliveryservice.service;

import com.example.deliveryservice.domain.Delivery;
import com.example.deliveryservice.domain.DeliveryRepository;
import com.example.deliveryservice.dto.DeliveryCompleteRequestDTO;
import com.example.deliveryservice.dto.DeliveryStartRequestDTO;
import com.example.deliveryservice.dto.RabbitResponseDTO;
import com.example.deliveryservice.event.OrderCreatedMessage;
import com.example.deliveryservice.type.OrderStatus;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DeliveryService {
    private final RabbitTemplate rabbitTemplate; // RabbitMQ 직접 접근용
    private final DeliveryRepository deliveryRepository;
    private final RedissonClient redissonClient;

    // DB저장 로직
    public Mono<Boolean> saveOrders(List<OrderCreatedMessage> messages){
        // 매개변수로 큐에 정보 묶음으로 받아와서 DB에 넣음
        List<Delivery> orders = messages.stream()
                .map(this::convertToEntity)
                .collect(Collectors.toList());

        return deliveryRepository.saveAll(orders)
                .doOnNext(saved -> log.info("Saved entity: {}", saved))
                .count()
                .doOnNext(count -> log.info("Saved count: {}", count))
                .map(savedCount -> savedCount == orders.size())
                .doOnError(e -> log.error("저장 중 예외 발생", e))
                .onErrorReturn(false);

    }
    public Delivery convertToEntity(OrderCreatedMessage message) {
        return Delivery.builder()
                .merchantUid(message.getMerchantUid())
                .status(message.getStatus())
                .riderUserUid(message.getRiderUserUid())
                .riderSocialUid(message.getRiderSocialUid())
                .addressStart(message.getAddressStart())
                .addressDestination(message.getAddressDestination())
                .deliveryAcceptTime(message.getDeliveryAcceptTime())
                .deliveredTime(message.getDeliveredTime())
                .version(0) // 새 엔티티는 버전 0부터 시작
                .build();
    }
    private OrderCreatedMessage convertToOrderCreatedMessage(Delivery delivery) {
        return OrderCreatedMessage.builder()
                .merchantUid(delivery.merchantUid())
                .status(delivery.status())
                .riderUserUid(delivery.riderUserUid())
                .riderSocialUid(delivery.riderSocialUid())
                .addressStart(delivery.addressStart())
                .addressDestination(delivery.addressDestination())
                .deliveryAcceptTime(delivery.deliveryAcceptTime())
                .deliveredTime(delivery.deliveredTime())
                .build();
    }

    // 조리중 상태 주문 조회
    public Flux<OrderCreatedMessage> getCookingOrders() {
        return deliveryRepository.getCookingOrders()
                .map(this::convertToOrderCreatedMessage);
    }

    // 배달중 상태 주문 조회
    public Flux<OrderCreatedMessage> getDeliveringOrders(String type,Integer uid) {
        if("user".equals(type)){
            return deliveryRepository.getDeliveringByUserUid(uid)
                    .map(this::convertToOrderCreatedMessage);
        }else{
            return deliveryRepository.getDeliveringBySocialUid(uid)
                    .map(this::convertToOrderCreatedMessage);
        }
    }

    @Transactional
    public Mono<RabbitResponseDTO> startDelivery(DeliveryStartRequestDTO deliveryStartRequestDTO) {
        log.info("start dto is :: {}", deliveryStartRequestDTO.toString());

        String lockKey = "lock:delivery:start:" + deliveryStartRequestDTO.getMerchantUid();
        RLock lock = redissonClient.getLock(lockKey);

        return Mono.fromCallable(() -> {
                    boolean acquired = lock.tryLock(3, 10, TimeUnit.SECONDS); // 최대 3초 대기, 10초 유지
                    if (!acquired) {
                        throw new IllegalStateException("이미 다른 요청이 처리 중입니다.");
                    }
                    return true;
                })
                .subscribeOn(Schedulers.boundedElastic()) // 블로킹 코드 offload
                .flatMap(locked -> deliveryRepository.findCookingByMerchantUid(deliveryStartRequestDTO.getMerchantUid())
                        .switchIfEmpty(Mono.error(new RuntimeException("배송 정보 없음")))
                        .flatMap(delivery -> {
                            Delivery updated = Delivery.builder()
                                    .uid(delivery.uid())
                                    .merchantUid(delivery.merchantUid())
                                    .riderUserUid(deliveryStartRequestDTO.getRiderUserUid())
                                    .riderSocialUid(deliveryStartRequestDTO.getRiderSocialUid())
                                    .addressStart(delivery.addressStart())
                                    .addressDestination(delivery.addressDestination())
                                    .deliveryAcceptTime(deliveryStartRequestDTO.getDeliveryAcceptTime())
                                    .deliveredTime(delivery.deliveredTime())
                                    .status(OrderStatus.ORDER_DELIVERING)
                                    .version(delivery.version())
                                    .build();
                            System.out.println("DB 저장하기 전");

                            // updateDelivery 메서드 호출 후 결과 처리
                            return deliveryRepository.updateDelivery(updated)
                                    .flatMap(updatedCount -> {
                                        if (updatedCount > 0) {
                                            // 업데이트 성공
                                            return Mono.just(updated);
                                        } else {
                                            // 업데이트 실패
                                            return Mono.error(new RuntimeException("배달 상태 업데이트 실패"));
                                        }
                                    })
                                    .map(this::convertToOrderCreatedMessage);
                        })
                        .flatMap(message -> {
                            try {
                                System.out.println("큐에 보내기 전");
                                rabbitTemplate.convertAndSend("status-change.order-service", message);
                                log.info("배달중 큐로 보낸 메시지: {}", message);

                                return Mono.just(RabbitResponseDTO.builder()
                                        .isSuccess(true)
                                        .message("배달이 시작 되었습니다.")
                                        .build());
                            } catch (Exception e) {
                                log.error("배달 시작 실패", e);
                                return Mono.just(RabbitResponseDTO.builder()
                                        .isSuccess(false)
                                        .message("배달 시작에 실패 했습니다!!")
                                        .build());
                            }
                        }))
                .onErrorResume(error -> {
                    log.error("전체 처리 중 예외 발생", error);
                    return Mono.just(RabbitResponseDTO.builder()
                            .isSuccess(false)
                            .message(error.getMessage())
                            .build());
                })
                .doFinally(signalType -> {
                    if (lock.isHeldByCurrentThread()) {
                        lock.unlock();
                        log.debug("락 해제 완료: {}", lockKey);
                    }
                });
    }

    @Transactional
    public Mono<RabbitResponseDTO> completeDelivery(DeliveryCompleteRequestDTO deliveryCompleteRequestDTO) {
        log.info("complete dto is :: {}", deliveryCompleteRequestDTO);

        return deliveryRepository.findDeliveringByMerchantUid(deliveryCompleteRequestDTO.getMerchantUid())
                .switchIfEmpty(Mono.error(new RuntimeException("배송 정보 없음")))
                .flatMap(delivery -> {
                    // 1. 상태 변경
                    Delivery updated = Delivery.builder()
                            .uid(delivery.uid())
                            .merchantUid(delivery.merchantUid())
                            .riderUserUid(delivery.riderUserUid())
                            .riderSocialUid(delivery.riderSocialUid())
                            .addressStart(delivery.addressStart())
                            .addressDestination(delivery.addressDestination())
                            .deliveryAcceptTime(delivery.deliveryAcceptTime())
                            .deliveredTime(deliveryCompleteRequestDTO.getDeliveredTime())
                            .status(OrderStatus.ORDER_DELIVERED)
                            .version(delivery.version())
                            .build();

                    // 2. DB 저장 후 업데이트된 행의 수 처리
                    return deliveryRepository.updateDelivery(updated)
                            .flatMap(updatedCount -> {
                                if (updatedCount > 0) {
                                    // 3. 업데이트 성공 시 메시지 변환
                                    return Mono.just(updated);
                                } else {
                                    // 4. 업데이트 실패 시 에러 처리
                                    return Mono.error(new RuntimeException("배달 상태 업데이트 실패"));
                                }
                            })
                            .map(this::convertToOrderCreatedMessage);
                })
                .flatMap(message -> {
                    try {
                        // 5. 메시지 큐 전송
                        rabbitTemplate.convertAndSend("status-change.order-service", message);
                        log.info("배달완료 큐로 보낸 메시지: {}", message);

                        // 6. 성공 응답 반환
                        return Mono.just(RabbitResponseDTO.builder()
                                .isSuccess(true)
                                .message("배달이 완료 되었습니다.")
                                .build());
                    } catch (Exception e) {
                        // 큐 전송 실패
                        log.error("배달 완료 큐 전송 실패", e);
                        return Mono.just(RabbitResponseDTO.builder()
                                .isSuccess(false)
                                .message("배달 완료에 실패 했습니다!!")
                                .build());
                    }
                })
                .onErrorResume(error -> {
                    log.error("배달 완료 처리 중 예외 발생", error);
                    return Mono.just(RabbitResponseDTO.builder()
                            .isSuccess(false)
                            .message("배달 완료 과정에서 오류가 발생했습니다.")
                            .build());
                });
    }


}

