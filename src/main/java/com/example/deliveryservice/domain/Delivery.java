package com.example.deliveryservice.domain;

import com.example.deliveryservice.type.OrderStatus;
import lombok.Builder;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Version;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDateTime;

@Builder
@Table("delivery")
public record Delivery(
        @Id
        @Column("uid")
        Integer uid,
        @Column("rider_user_uid")
        Integer riderUserUid,
        @Column("rider_social_uid")
        Integer riderSocialUid,
        @Column("merchant_uid")
        String merchantUid,
        OrderStatus status,
        @Column("address_start")
        String addressStart,
        @Column("address_destination")
        String addressDestination,
        @Column("delivery_accept_time")
        LocalDateTime deliveryAcceptTime,
        @Column("delivered_time")
        LocalDateTime deliveredTime ,
        @Version int version
) {
}
