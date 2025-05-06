package com.example.deliveryservice.service;

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

@Slf4j
@Service
@RequiredArgsConstructor
public class DeliveryService {
    private final RabbitTemplate rabbitTemplate; // RabbitMQ 직접 접근용
    private final ObjectMapper objectMapper;

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

    public RabbitResponseDTO startDelivery(DeliveryStartRequestDTO deliveryStartRequestDTO) {
        // DTO 받아서 DB에 저장하고 큐에 정보 전달

        // 1. 큐에서 메시지 수동 소비 (ex: order-preparing)
        Object message = rabbitTemplate.receiveAndConvert("order-cooking.order-service");
        OrderCreatedMessage received = objectMapper.convertValue(message, OrderCreatedMessage.class);


        if (received != null) {
            log.info("조리중 큐에서 받은 메시지: {}", received);
        } else {
            log.warn("조리중 큐에서 메시지를 받지 못했습니다.");
        }

        //received.setDeliveryManUid(uid);
        //received.setDeliveryManType(type);
        received.setStatus(OrderStatus.ORDER_DELIVERING);

        try {
            // 메시지 전송
            rabbitTemplate.convertAndSend("status-change.order-service", received);
            log.info("배달중 큐로 보낸 메시지: {}", received);
            return RabbitResponseDTO.builder()
                    .isSuccess(true)
                    .message("배달이 시작 되었습니다.")
                    .build();
        } catch (Exception e) {
            return RabbitResponseDTO.builder()
                    .isSuccess(false)
                    .message("배달 시작에 실패 했습니다!!")
                    .build();
        }
    }

    public RabbitResponseDTO completeDelivery(DeliveryCompleteRequestDTO deliveryCompleteRequestDTO) {
        // 1. 큐에서 메시지 수동 소비 (ex: order-preparing)
        Object message = rabbitTemplate.receiveAndConvert("order-delivering.order-service");
        OrderCreatedMessage received = objectMapper.convertValue(message, OrderCreatedMessage.class);

        if (received != null) {
            log.info("배달중 큐에서 받은 메시지: {}", received);
        } else {
            log.warn("배달중 큐에서 메시지를 받지 못했습니다.");
        }

        received.setStatus(OrderStatus.ORDER_DELIVERED);

        try {
            // 메시지 전송
            rabbitTemplate.convertAndSend("status-change.order-service", received);
            log.info("배달 완료 큐로 보낸 메시지: {}", received);
            return RabbitResponseDTO.builder()
                    .isSuccess(true)
                    .message("배달이 완료 되었습니다.")
                    .build();
        } catch (Exception e) {
            return RabbitResponseDTO.builder()
                    .isSuccess(false)
                    .message("배달 완료에 실패 했습니다!!")
                    .build();
        }

    }
}

