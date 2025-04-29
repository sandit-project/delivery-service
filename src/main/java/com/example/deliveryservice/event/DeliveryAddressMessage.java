package com.example.deliveryservice.event;

public record DeliveryAddressMessage(
        String addressStart,
        Double addressStartLat,
        Double addressStartLan,
        String addressDestination,
        Double addressDestinationLat,
        Double addressDestinationLan
) {}
