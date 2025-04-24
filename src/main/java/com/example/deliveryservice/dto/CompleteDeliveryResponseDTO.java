package com.example.deliveryservice.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CompleteDeliveryResponseDTO {
    private boolean isSuccess;
    private String message;
}
