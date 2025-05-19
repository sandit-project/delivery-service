package com.example.deliveryservice.rabbit;

import com.example.deliveryservice.event.OrderCreatedMessage;
import com.example.deliveryservice.service.DeliveryService;
import com.example.deliveryservice.type.OrderStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

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
    private final RabbitTemplate rabbitTemplate;

    // saveOrders 전용 버퍼
    private final List<OrderCreatedMessage> saveBuffer = Collections.synchronizedList(new ArrayList<>());
    // orderRollback 전용 버퍼
    private final List<OrderCreatedMessage> rollbackBuffer = Collections.synchronizedList(new ArrayList<>());

    private final int BATCH_SIZE = 5;
    private final long FLUSH_INTERVAL_MS = 10_000; // 10초
    private final int MAX_RETRIES = 3;

    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();

    // saveOrders 전용 예약 플러시
    private ScheduledFuture<?> scheduledSaveFlush;
    // orderRollback 전용 예약 플러시
    private ScheduledFuture<?> scheduledRollbackFlush;

    // 기존 saveOrders() 메서드 - 변경 없이 유지 (필요 시 buffer → saveBuffer, scheduledFlush → scheduledSaveFlush 변경 권장)
    @Bean
    public Consumer<OrderCreatedMessage> saveOrders() {
        return message -> {
            log.info("Order Cooking Message 수신: {}", message);
            saveBuffer.add(message);

            if (saveBuffer.size() >= BATCH_SIZE) {
                flushSaveBuffer();
            } else {
                scheduleSaveFlushIfNeeded();
            }
        };
    }

    private void flushSaveBuffer() {
        List<OrderCreatedMessage> batchToSave;

        synchronized (saveBuffer) {
            if (saveBuffer.isEmpty()) return;
            batchToSave = new ArrayList<>(saveBuffer);
            saveBuffer.clear();
        }

        attemptSave(batchToSave, 0);

        if (scheduledSaveFlush != null && !scheduledSaveFlush.isDone()) {
            scheduledSaveFlush.cancel(false);
        }
    }

    private void scheduleSaveFlushIfNeeded() {
        if (scheduledSaveFlush == null || scheduledSaveFlush.isDone()) {
            scheduledSaveFlush = scheduler.schedule(this::flushSaveBuffer, FLUSH_INTERVAL_MS, TimeUnit.MILLISECONDS);
        }
    }

    private void attemptSave(List<OrderCreatedMessage> batch, int retryCount) {
        deliveryService.saveOrders(batch)
                .subscribe(success -> {
                    if (success) {
                        log.info("배치 저장 성공: {}건", batch.size());
                    } else {
                        log.warn("배치 저장 실패. 재시도 {}회", retryCount + 1);
                        if (retryCount < MAX_RETRIES) {
                            attemptSave(batch, retryCount + 1);
                        } else {
                            log.error("배치 저장 실패 보상 큐 전송");
                            batch.forEach(msg -> {
                                msg.setStatus(OrderStatus.ORDER_CONFIRMED);
                                rabbitTemplate.convertAndSend("status-change.order-service", msg);
                            });
                        }
                    }
                }, error -> {
                    log.error("배치 저장 중 예외 발생: {}", error.getMessage());
                    if (retryCount < MAX_RETRIES) {
                        attemptSave(batch, retryCount + 1);
                    } else {
                        batch.forEach(msg -> {
                            msg.setStatus(OrderStatus.ORDER_CONFIRMED);
                            rabbitTemplate.convertAndSend("status-change.order-service", msg);
                        });
                    }
                });
    }

    // orderRollback 전용 Consumer 및 플러시, 재시도 로직
    @Bean
    public Consumer<OrderCreatedMessage> orderRollback() {
        return message -> {
            log.info("Order Rollback Message 수신: {}", message);
            rollbackBuffer.add(message);

            if (rollbackBuffer.size() >= BATCH_SIZE) {
                flushRollbackBuffer();
            } else {
                scheduleRollbackFlushIfNeeded();
            }
        };
    }

    private void flushRollbackBuffer() {
        List<OrderCreatedMessage> batchToUpdate;

        synchronized (rollbackBuffer) {
            if (rollbackBuffer.isEmpty()) return;
            batchToUpdate = new ArrayList<>(rollbackBuffer);
            rollbackBuffer.clear();
        }

        attemptRollbackUpdate(batchToUpdate, 0);

        if (scheduledRollbackFlush != null && !scheduledRollbackFlush.isDone()) {
            scheduledRollbackFlush.cancel(false);
        }
    }

    private void scheduleRollbackFlushIfNeeded() {
        if (scheduledRollbackFlush == null || scheduledRollbackFlush.isDone()) {
            scheduledRollbackFlush = scheduler.schedule(this::flushRollbackBuffer, FLUSH_INTERVAL_MS, TimeUnit.MILLISECONDS);
        }
    }

    private void attemptRollbackUpdate(List<OrderCreatedMessage> batch, int retryCount) {
        deliveryService.updateOrders(batch)
                .subscribe(success -> {
                    if (success) {
                        log.info("배치 업데이트 성공: {}건", batch.size());
                    } else {
                        log.warn("배치 업데이트 실패. 재시도 {}회", retryCount + 1);
                        if (retryCount < MAX_RETRIES) {
                            attemptRollbackUpdate(batch, retryCount + 1);
                        } else {
                            log.error("보상 메시지 처리 실패. 수동 조치 필요.");
                            batch.forEach(msg -> log.error("보상 실패 메시지: {}", msg));
                        }
                    }
                }, error -> {
                    log.error("업데이트 중 예외 발생: {}", error.getMessage());
                    if (retryCount < MAX_RETRIES) {
                        attemptRollbackUpdate(batch, retryCount + 1);
                    } else {
                        batch.forEach(msg -> {
                            msg.setStatus(OrderStatus.ORDER_CONFIRMED);
                            rabbitTemplate.convertAndSend("status-change.order-service", msg);
                        });
                    }
                });
    }
}
