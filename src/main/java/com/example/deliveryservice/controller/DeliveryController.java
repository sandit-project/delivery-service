package com.example.deliveryservice.controller;

import com.example.deliveryservice.dto.DeliveryCompleteRequestDTO;
import com.example.deliveryservice.dto.DeliveryStartRequestDTO;
import com.example.deliveryservice.dto.RabbitResponseDTO;
import com.example.deliveryservice.event.OrderCreatedMessage;
import com.example.deliveryservice.service.DeliveryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.List;

@RestController
@RequestMapping("/deliveries")
@RequiredArgsConstructor
public class DeliveryController {
    private final DeliveryService deliveryService;

    @GetMapping("/status/cooking")
    public Mono<List<OrderCreatedMessage>> getCookingOrders() {
        return deliveryService.getCookingOrders()
                .collectList();
    }

    @GetMapping("status/delivering/{type}/{uid}")
    public Mono<List<OrderCreatedMessage>> getDeliveringOrders(@PathVariable(name = "type")String type,
                                                               @PathVariable(name = "uid")Integer uid) {
        return deliveryService.getDeliveringOrders(type,uid)
                .collectList();
    }

    @PostMapping("/start")
    public Mono<ResponseEntity<RabbitResponseDTO>> startDelivery(@RequestBody DeliveryStartRequestDTO deliveryStartRequestDTO) {
        return deliveryService.startDelivery(deliveryStartRequestDTO)
                .map(ResponseEntity::ok)
                .onErrorResume(e -> Mono.just(ResponseEntity
                        .badRequest()
                        .body(RabbitResponseDTO.builder()
                                .isSuccess(false)
                                .message(e.getMessage())
                                .build())));
    }

    @PostMapping("/complete")
    public Mono<ResponseEntity<RabbitResponseDTO>> completeDelivery(@RequestBody DeliveryCompleteRequestDTO deliveryCompleteRequestDTO) {
        return deliveryService.completeDelivery(deliveryCompleteRequestDTO)
                .map(ResponseEntity::ok)
                .onErrorResume(e -> Mono.just(ResponseEntity
                        .badRequest()
                        .body(RabbitResponseDTO.builder()
                                .isSuccess(false)
                                .message(e.getMessage())
                                .build())));
    }

}
