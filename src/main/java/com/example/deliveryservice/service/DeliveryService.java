package com.example.deliveryservice.service;

import com.example.deliveryservice.dto.CompleteDeliveryResponseDTO;
import com.example.deliveryservice.dto.OrderInfo;
import com.example.deliveryservice.dto.StartDeliveryResponseDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.cloud.stream.function.StreamBridge;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DeliveryService {
    private final StreamBridge streamBridge; // Spring Cloud Stream을 통한 이벤트 발행
    private final ObjectMapper objectMapper; // Jackson (bean 등록돼 있어야 함)
    private final RabbitTemplate rabbitTemplate; // RabbitMQ 직접 접근용

    public StartDeliveryResponseDTO startDelivery(Integer uid) {

        // 1. 큐에서 메시지 수동 소비 (ex: order-preparing)
        Message message = rabbitTemplate.receive("order-preparing");

        if (message == null) {
            throw new RuntimeException("No message in the queue.");
        }

        try {
            // 2. 메시지 바디 -> OrderInfo 객체로 변환
            byte[] body = message.getBody();
            OrderInfo order = objectMapper.readValue(body, OrderInfo.class);

            // 3. uid 추가
            order.setDeliveryUid(uid);

            // 4. 큐로 다시 발행
            streamBridge.send("pack-out-0", order);

            return StartDeliveryResponseDTO.builder()
                    .isSuccess(true)
                    .message("배달이 시작 되었습니다.")
                    .build();

        } catch (Exception e) {
            return StartDeliveryResponseDTO.builder()
                    .isSuccess(false)
                    .message("배달 시작에 실패 했습니다!!")
                    .build();
        }
    }

    public CompleteDeliveryResponseDTO completeDelivery(Integer uid) {

        // 1. 큐에서 메시지 수동 소비 (ex: order-preparing)
        Message message = rabbitTemplate.receive("order-delivering");

        if (message == null) {
            throw new RuntimeException("No message in the queue.");
        }

        try {
            // 2. 메시지 바디 -> OrderInfo 객체로 변환
            byte[] body = message.getBody();
            OrderInfo order = objectMapper.readValue(body, OrderInfo.class);

            // 4. 큐로 다시 발행
            streamBridge.send("pack-out-0", order);

            return CompleteDeliveryResponseDTO.builder()
                    .isSuccess(true)
                    .message("배달이 완료 되었습니다.")
                    .build();

        } catch (Exception e) {
            return CompleteDeliveryResponseDTO.builder()
                    .isSuccess(false)
                    .message("배달 완료에 실패 했습니다!!")
                    .build();
        }
    }
}

