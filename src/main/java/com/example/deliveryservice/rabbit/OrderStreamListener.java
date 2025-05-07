package com.example.deliveryservice.rabbit;

import com.example.deliveryservice.event.OrderCreatedMessage;
import com.example.deliveryservice.service.DeliveryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

    private final List<OrderCreatedMessage> buffer = Collections.synchronizedList(new ArrayList<>());
    private final int BATCH_SIZE = 5;
    private final long FLUSH_INTERVAL_MS = 10_000; // 10초

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

        deliveryService.saveOrders(batchToSave)
                .subscribe(success -> {
                    if (success) log.info("배치 저장 성공: {}건", batchToSave.size());
                    else log.error("배치 저장 실패");
                });

        // 기존 예약된 flush는 취소
        if (scheduledFlush != null && !scheduledFlush.isDone()) {
            scheduledFlush.cancel(false);
        }
    }

    private void scheduleFlushIfNeeded() {
        if (scheduledFlush == null || scheduledFlush.isDone()) {
            scheduledFlush = scheduler.schedule(this::flushBuffer, FLUSH_INTERVAL_MS, TimeUnit.MILLISECONDS);
        }
    }
}
