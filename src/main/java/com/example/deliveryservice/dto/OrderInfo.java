package com.example.deliveryservice.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class OrderInfo {
    private String merchantUid;
    private Integer userUid;
    private String status;
    private Integer deliveryUid;
    private String addressStart;
    private double addressStartLat;
    private double addressStartLng;
    private String addressEnd;
    private double addressEndLat;
    private double addressEndLng;
}
