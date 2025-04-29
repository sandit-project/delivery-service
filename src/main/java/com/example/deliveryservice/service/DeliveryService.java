package com.example.deliveryservice.service;

import com.example.deliveryservice.dto.CompleteDeliveryResponseDTO;
import com.example.deliveryservice.event.DeliveryAddressMessage;
import com.example.deliveryservice.event.OrderCreatedMessage;
import com.example.deliveryservice.dto.StartDeliveryResponseDTO;
import com.example.deliveryservice.event.OrderItemMessage;
import com.example.deliveryservice.type.OrderStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class DeliveryService {
    private final RabbitTemplate rabbitTemplate; // RabbitMQ 직접 접근용

    // 래빗 테스트용 코드
    public void testRabbit(){
        System.out.println("래빗 테스트 실행됨");
        List<OrderItemMessage> itemMessages = new ArrayList<>();
        OrderItemMessage items1 = new OrderItemMessage("에그마요 샌드위치",2,550.0,5500,0);
        OrderItemMessage items2 = new OrderItemMessage("감자튀김",1,300.0,3000,0);
        itemMessages.add(items1);
        itemMessages.add(items2);

        OrderCreatedMessage message = OrderCreatedMessage.builder()
                .merchantUid("order-123456789")
                .userUid(5)
                .socialUid(null)
                .deliveryManUid(null)
                .deliveryManType(null)
                .storeUid(1)
                .deliveryAddress(new DeliveryAddressMessage(
                        "서울특별시 강남구 테헤란로 123",
                        37.5665,
                        126.9780,
                        "서울특별시 서초구 강남대로 456",
                        37.4847,
                        127.0364
                ))
                .items(itemMessages)
                .status(OrderStatus.PAYMENT_COMPLETED)
                .createdDate(LocalDateTime.now())
                .build();

        // 메시지 전송
        rabbitTemplate.convertAndSend("order-created.order-service", message);

        // 1. 큐에서 메시지 수동 소비 (ex: order-preparing)
        OrderCreatedMessage received = (OrderCreatedMessage) rabbitTemplate.receiveAndConvert("order-created.order-service");

        if (received != null) {
            log.info("큐에서 받은 메시지: {}", received);
        } else {
            log.warn("큐에서 메시지를 받지 못했습니다.");
        }
    }

    public StartDeliveryResponseDTO startDelivery(Integer uid, String type) {
        // 1. 큐에서 메시지 수동 소비 (ex: order-preparing)
        OrderCreatedMessage received = (OrderCreatedMessage) rabbitTemplate.receiveAndConvert("order-cooking.order-service");

        if (received != null) {
            log.info("조리중 큐에서 받은 메시지: {}", received);
        } else {
            log.warn("조리중 큐에서 메시지를 받지 못했습니다.");
        }

        received.setDeliveryManUid(uid);
        received.setDeliveryManType(type);
        received.setStatus(OrderStatus.ORDER_DELIVERING);

        try {
            // 메시지 전송
            rabbitTemplate.convertAndSend("order-delivering.order-service", received);
            log.info("배달중 큐로 보낸 메시지: {}", received);
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

    public CompleteDeliveryResponseDTO completeDelivery(Integer uid, String type) {
        // 1. 큐에서 메시지 수동 소비 (ex: order-preparing)
        OrderCreatedMessage received = (OrderCreatedMessage) rabbitTemplate.receiveAndConvert("order-delivering.order-service");

        if (received != null) {
            log.info("배달중 큐에서 받은 메시지: {}", received);
        } else {
            log.warn("배달중 큐에서 메시지를 받지 못했습니다.");
        }

        received.setStatus(OrderStatus.ORDER_DELIVERED);

        if(uid.equals(received.getDeliveryManUid()) && type.equals(received.getDeliveryManType())){
            try {
                // 메시지 전송
                rabbitTemplate.convertAndSend("order-delivered.order-service", received);
                log.info("배달 완료 큐로 보낸 메시지: {}", received);
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
        }else{
            return CompleteDeliveryResponseDTO.builder()
                    .isSuccess(false)
                    .message("배달원이 일치 하지 않습니다.")
                    .build();
        }
    }
}

