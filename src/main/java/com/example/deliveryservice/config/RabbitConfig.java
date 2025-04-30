package com.example.deliveryservice.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitAdmin;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class RabbitConfig {

    private final ConnectionFactory connectionFactory;

    // 큐 1: 결제 완료 큐
    @Bean
    public Queue paymentCompletedQueue() {
        return new Queue("order-created.order-service", true);
    }

    // 큐 2: 주문 수락 큐
    @Bean
    public Queue orderConfirmedQueue() {
        return new Queue("order-accepted.order-service", true);
    }

    // 큐 3: 주문 취소 큐
    @Bean
    public Queue orderCancelledQueue() {
        return new Queue("order-cancelled.order-service", true);
    }

    // 큐 4: 조리중 큐
    @Bean
    public Queue orderCookingQueue() {
        return new Queue("order-cooking.order-service", true);
    }

    // 큐 5: 배달 시작 큐
    @Bean
    public Queue orderDeliveringQueue() {
        return new Queue("order-delivering.order-service", true);
    }

    // 큐 6: 배달 완료 큐
    @Bean
    public Queue orderDeliveredQueue() {
        return new Queue("order-delivered.order-service", true);
    }

    // 큐 7: 메뉴 등록 큐
    @Bean
    public Queue menuAddQueue() {
        return new Queue("menu-add.menu-service", true);
    }

    // 큐 8: 메뉴 수정 큐
    @Bean
    public Queue menuUpdateQueue() {
        return new Queue("menu-update.menu-service", true);
    }

    // 큐 9: 메뉴 등록 큐
    @Bean
    public Queue storeAddQueue() {
        return new Queue("store-add.store-service", true);
    }

    // 큐 10: 메뉴 수정 큐
    @Bean
    public Queue storeUpdateQueue() {
        return new Queue("store-update.store-service", true);
    }

    // 큐 11: status 변경 큐
    @Bean
    public Queue statusChangeQueue() {
        return new Queue("status-change.order-service", true);
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jackson2MessageConverter());
        return template;
    }

    @Bean
    public MessageConverter jackson2MessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    // RabbitAdmin으로 큐 선언 보장
    @Bean
    public RabbitAdmin rabbitAdmin() {
        RabbitAdmin rabbitAdmin = new RabbitAdmin(connectionFactory);
        // 주문 큐 등록
        rabbitAdmin.declareQueue(paymentCompletedQueue());
        rabbitAdmin.declareQueue(orderConfirmedQueue());
        rabbitAdmin.declareQueue(orderCancelledQueue());
        rabbitAdmin.declareQueue(orderCookingQueue());
        rabbitAdmin.declareQueue(orderDeliveringQueue());
        rabbitAdmin.declareQueue(orderDeliveredQueue());
        rabbitAdmin.declareQueue(statusChangeQueue());
        // 메뉴 큐 등록
        rabbitAdmin.declareQueue(menuAddQueue());
        rabbitAdmin.declareQueue(menuUpdateQueue());
        // 지점 큐 등록
        rabbitAdmin.declareQueue(storeAddQueue());
        rabbitAdmin.declareQueue(storeUpdateQueue());
        return rabbitAdmin;
    }
}
