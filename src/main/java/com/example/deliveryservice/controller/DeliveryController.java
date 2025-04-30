package com.example.deliveryservice.controller;

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

    @GetMapping("/{uid}/{type}/start")
    public RabbitResponseDTO startDelivery(@PathVariable(name = "uid") Integer uid, @PathVariable(name = "type") String type) {
        return deliveryService.startDelivery(uid, type);
    }

    @GetMapping("/{uid}/{type}/complete")
    public RabbitResponseDTO completeDelivery(@PathVariable(name = "uid") Integer uid, @PathVariable(name = "type") String type) {
        return deliveryService.completeDelivery(uid, type);
    }


}
