package com.example.deliveryservice.controller;

import com.example.deliveryservice.dto.DeliveryCompleteRequestDTO;
import com.example.deliveryservice.dto.DeliveryStartRequestDTO;
import com.example.deliveryservice.dto.RabbitResponseDTO;
import com.example.deliveryservice.service.DeliveryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/deliveries")
@RequiredArgsConstructor
public class DeliveryController {
    private final DeliveryService deliveryService;

    // 테스트 엔드포인트
    @GetMapping
    public void test(){
        deliveryService.testRabbit();
    }

    @PostMapping("/start")
    public RabbitResponseDTO startDelivery(@RequestBody DeliveryStartRequestDTO deliveryStartRequestDTO) {
        return deliveryService.startDelivery(deliveryStartRequestDTO);
    }

    @PostMapping("/complete")
    public RabbitResponseDTO completeDelivery(@RequestBody DeliveryCompleteRequestDTO deliveryCompleteRequestDTO) {
        return deliveryService.completeDelivery(deliveryCompleteRequestDTO);
    }


}
