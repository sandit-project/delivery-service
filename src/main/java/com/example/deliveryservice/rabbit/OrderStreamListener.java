package com.example.deliveryservice.rabbit;

import com.example.deliveryservice.event.OrderCreatedMessage;
import com.example.deliveryservice.service.DeliveryService;
import com.example.deliveryservice.type.OrderStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.cloud.stream.function.StreamBridge;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.support.MessageBuilder;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;
import java.util.function.Consumer;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class OrderStreamListener {

    private final DeliveryService deliveryService;
    private final StreamBridge streamBridge;
    private final RabbitTemplate rabbitTemplate; // RabbitMQ 직접 접근용

    private final List<OrderCreatedMessage> buffer = Collections.synchronizedList(new ArrayList<>());
    private final int BATCH_SIZE = 5;
    private final long FLUSH_INTERVAL_MS = 10_000; // 10초
    private final int MAX_RETRIES = 3;  // 3회까지 재시도

    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();
    private ScheduledFuture<?> scheduledFlush;

    @Bean
    public Consumer<OrderCreatedMessage> saveOrders() {
        return message -> {
            log.info("Order Message 수신: {}", message);
            buffer.add(message);

            if (buffer.size() >= BATCH_SIZE) {
                flushBuffer();
            } else {
                scheduleFlushIfNeeded();
            }
        };
    }

    private void flushBuffer() {
        List<OrderCreatedMessage> batchToSave;

        synchronized (buffer) {
            if (buffer.isEmpty()) return;
            batchToSave = new ArrayList<>(buffer);
            buffer.clear();
        }

        attemptSave(batchToSave, 0);

        deliveryService.saveOrders(batchToSave)
                .subscribe(success -> {
                    // 실패시 보상 로직 필요함 (롤백 처리)
                    if (success) log.info("배치 저장 성공: {}건", batchToSave.size());
                    else log.error("배치 저장 실패");
                });

        // 기존 예약된 flush는 취소
        if (scheduledFlush != null && !scheduledFlush.isDone()) {
            scheduledFlush.cancel(false);
        }
    }

    private void attemptSave(List<OrderCreatedMessage> batch, int retryCount) {
        List<OrderCreatedMessage> failedMessages = new ArrayList<>();  // 실패한 메시지를 저장할 리스트

        // 배치 단위로 처리
        deliveryService.saveOrders(batch)
                .subscribe(success -> {
                    if (success) {
                        log.info("배치 저장 성공: {}건", batch.size());
                    } else {
                        log.warn("배치 저장 실패. 재시도 {}회", retryCount + 1);
                        // 실패한 메시지만 따로 저장
                        batch.forEach(msg -> failedMessages.add(msg));

                        if (retryCount < MAX_RETRIES) {
                            attemptSave(batch, retryCount + 1);
                        } else {
                            log.error("배치 저장 실패 - {}건의 메시지 보상 전송 시작", failedMessages.size());
                            // 실패한 메시지들만 보상 큐로 전송
                            failedMessages.forEach(msg -> {
                                msg.setStatus(OrderStatus.ORDER_CONFIRMED);
                                rabbitTemplate.convertAndSend("status-change.order-service", msg);
                            });
                        }
                    }
                }, error -> {
                    log.error("배치 처리 중 예외 발생: {}", error.getMessage());
                    if (retryCount < MAX_RETRIES) {
                        attemptSave(batch, retryCount + 1);
                    } else {
                        // 예외 발생 시 실패한 메시지만 보상 큐로 전송
                        batch.forEach(msg -> {
                            msg.setStatus(OrderStatus.ORDER_CONFIRMED);
                            rabbitTemplate.convertAndSend("status-change.order-service", msg);
                        });
                    }
                });
    }



    private void scheduleFlushIfNeeded() {
        if (scheduledFlush == null || scheduledFlush.isDone()) {
            scheduledFlush = scheduler.schedule(this::flushBuffer, FLUSH_INTERVAL_MS, TimeUnit.MILLISECONDS);
        }
    }
}
