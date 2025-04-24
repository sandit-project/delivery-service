package com.example.deliveryservice.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class StartDeliveryResponseDTO {
    private boolean isSuccess;
    private String message;
}
