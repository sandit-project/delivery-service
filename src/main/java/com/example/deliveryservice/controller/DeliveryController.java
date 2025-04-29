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

    @PostMapping("/{uid}/{type}/start")
    public StartDeliveryResponseDTO startDelivery(@PathVariable(name = "uid") Integer uid, @PathVariable(name = "type") String type) {
        return deliveryService.startDelivery(uid, type);
    }

    @PostMapping("/{uid}/{type}/complete")
    public CompleteDeliveryResponseDTO completeDelivery(@PathVariable(name = "uid") Integer uid, @PathVariable(name = "type") String type) {
        return deliveryService.completeDelivery(uid, type);
    }
}
