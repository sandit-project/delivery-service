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
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DeliveryService {
    private final RabbitTemplate rabbitTemplate; // RabbitMQ 직접 접근용
    private final ObjectMapper objectMapper;
    private final DeliveryRepository deliveryRepository;

    // 래빗 테스트용 코드
    public void testRabbit(){
        // 1. 큐에서 메시지 수동 소비 (ex: order-preparing)
        Object message = rabbitTemplate.receiveAndConvert("order-created.order-service");
        OrderCreatedMessage received = objectMapper.convertValue(message, OrderCreatedMessage.class);


        if (received != null) {
            log.info("큐에서 받은 메시지: {}", received);
        } else {
            log.warn("큐에서 메시지를 받지 못했습니다.");
        }

        received.setStatus(OrderStatus.ORDER_CONFIRMED);

        rabbitTemplate.convertAndSend("status-change.order-service", received);
        log.info("큐로 보낸 메시지: {}", received);
    }

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
    private Delivery convertToEntity(OrderCreatedMessage message) {
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
    public Flux<OrderCreatedMessage> getDeliveringOrders() {
        return deliveryRepository.getDeliveringOrders()
                .map(this::convertToOrderCreatedMessage);
    }

    public Mono<RabbitResponseDTO> startDelivery(DeliveryStartRequestDTO deliveryStartRequestDTO) {
        return deliveryRepository.findCookingByMerchantUid(deliveryStartRequestDTO.getMerchantUid())
                .switchIfEmpty(Mono.error(new RuntimeException("배송 정보 없음")))
                .map(this::convertToOrderCreatedMessage)
                .flatMap(delivery -> {
                    // 1. 상태 변경
                    delivery.setStatus(OrderStatus.ORDER_DELIVERING);

                    // 2. DB 저장
                    return deliveryRepository.save(convertToEntity(delivery))
                            .map(this::convertToOrderCreatedMessage); // 저장된 결과를 메시지로 변환
                })
                .flatMap(message -> {
                    try {
                        // 3. 메시지 큐 전송
                        rabbitTemplate.convertAndSend("status-change.order-service", message);
                        log.info("배달중 큐로 보낸 메시지: {}", message);

                        // 4. 성공 응답 반환
                        return Mono.just(RabbitResponseDTO.builder()
                                .isSuccess(true)
                                .message("배달이 시작 되었습니다.")
                                .build());
                    } catch (Exception e) {
                        // 예외 발생 시 실패 응답 반환
                        log.error("배달 시작 실패", e);
                        return Mono.just(RabbitResponseDTO.builder()
                                .isSuccess(false)
                                .message("배달 시작에 실패 했습니다!!")
                                .build());
                    }
                });
    }

    public Mono<RabbitResponseDTO> completeDelivery(DeliveryCompleteRequestDTO deliveryCompleteRequestDTO) {
        return deliveryRepository.findDeliveringByMerchantUid(deliveryCompleteRequestDTO.getMerchantUid())
                .switchIfEmpty(Mono.error(new RuntimeException("배송 정보 없음")))
                .map(this::convertToOrderCreatedMessage)
                .flatMap(delivery -> {
                    // 1. 상태 변경
                    delivery.setStatus(OrderStatus.ORDER_DELIVERED);

                    // 2. DB 저장
                    return deliveryRepository.save(convertToEntity(delivery))
                            .map(this::convertToOrderCreatedMessage); // 저장된 결과를 메시지로 변환
                })
                .flatMap(message -> {
                    try {
                        // 3. 메시지 큐 전송
                        rabbitTemplate.convertAndSend("status-change.order-service", message);
                        log.info("배달완료 큐로 보낸 메시지: {}", message);

                        // 4. 성공 응답 반환
                        return Mono.just(RabbitResponseDTO.builder()
                                .isSuccess(true)
                                .message("배달이 완료 되었습니다.")
                                .build());
                    } catch (Exception e) {
                        // 예외 발생 시 실패 응답 반환
                        log.error("배달 완료 실패", e);
                        return Mono.just(RabbitResponseDTO.builder()
                                .isSuccess(false)
                                .message("배달 완료에 실패 했습니다!!")
                                .build());
                    }
                });
    }
}

