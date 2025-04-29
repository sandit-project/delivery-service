package com.example.deliveryservice.event;

import com.example.deliveryservice.type.OrderStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
public class OrderCreatedMessage {
    private String merchantUid;
    private Integer userUid;
    private Integer socialUid;
    private Integer deliveryManUid;
    private String deliveryManType;
    private Integer storeUid;
    private DeliveryAddressMessage deliveryAddress;
    private List<OrderItemMessage> items;
    private OrderStatus status;
    private LocalDateTime createdDate;
}
