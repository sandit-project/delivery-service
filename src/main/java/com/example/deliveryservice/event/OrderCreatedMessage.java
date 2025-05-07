package com.example.deliveryservice.event;

import com.example.deliveryservice.type.OrderStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
public class OrderCreatedMessage {
    private String merchantUid;
    private OrderStatus status;
    private Integer riderUserUid;
    private Integer riderSocialUid;
    private String addressStart;
    private String addressDestination;
    private LocalDateTime deliveryAcceptTime;
    private LocalDateTime deliveredTime;
}
