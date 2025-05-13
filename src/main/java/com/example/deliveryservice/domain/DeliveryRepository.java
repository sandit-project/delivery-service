package com.example.deliveryservice.domain;

import org.springframework.data.repository.query.Param;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.r2dbc.repository.Modifying;
import org.springframework.data.r2dbc.repository.Query;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Repository
public interface DeliveryRepository extends ReactiveCrudRepository<Delivery, Integer> {
    @Query("SELECT * FROM `delivery` WHERE `status` = 'ORDER_COOKING'")
    Flux<Delivery> getCookingOrders();

    @Query("SELECT * FROM `delivery` WHERE `rider_user_uid` = :uid AND `status` = 'ORDER_DELIVERING'")
    Flux<Delivery> getDeliveringByUserUid(@Param("uid") Integer uid);

    @Query("SELECT * FROM `delivery` WHERE `rider_social_uid` = :uid AND `status` = 'ORDER_DELIVERING'")
    Flux<Delivery> getDeliveringBySocialUid(@Param("uid") Integer uid);

    @Query("SELECT * FROM `delivery` WHERE `merchant_uid` = :merchantUid AND `status` = 'ORDER_COOKING'")
    Mono<Delivery> findCookingByMerchantUid(@Param("merchantUid") String merchantUid);

    @Query("SELECT * FROM `delivery` WHERE `merchant_uid` = :merchantUid AND `status` = 'ORDER_DELIVERING'")
    Mono<Delivery> findDeliveringByMerchantUid(@Param("merchantUid") String merchantUid);

    @Modifying
    @Query("""
    UPDATE delivery
    SET
        rider_user_uid = :#{#delivery.riderUserUid},
        rider_social_uid = :#{#delivery.riderSocialUid},
        delivery_accept_time = :#{#delivery.deliveryAcceptTime},
        delivered_time = :#{#delivery.deliveredTime},
        status = :#{#delivery.status}
    WHERE uid = :#{#delivery.uid}
    """)
    Mono<Integer> updateDelivery(@Param("delivery") Delivery delivery);


}
