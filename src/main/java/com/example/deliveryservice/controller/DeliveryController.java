package com.example.deliveryservice.controller;

import com.example.deliveryservice.dto.CompleteDeliveryResponseDTO;
import com.example.deliveryservice.dto.StartDeliveryResponseDTO;
import com.example.deliveryservice.service.DeliveryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/deliveries")
@RequiredArgsConstructor
public class DeliveryController {
    private final DeliveryService deliveryService;

    @PostMapping("/{uid}/start")
    public StartDeliveryResponseDTO startDelivery(@PathVariable Integer uid) {
        return deliveryService.startDelivery(uid);
    }

    @PostMapping("/{uid}/complete")
    public CompleteDeliveryResponseDTO completeDelivery(@PathVariable Integer uid) {
        return deliveryService.completeDelivery(uid);
    }
}
