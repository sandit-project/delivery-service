package com.example.deliveryservice.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitAdmin;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class RabbitConfig {

    private final ConnectionFactory connectionFactory;

    // 주문 취소 큐
    @Bean
    public Queue orderCancelledQueue() {
        return new Queue("order-cancelled.order-service", true);
    }

    // 조리중 큐
    @Bean
    public Queue orderCookingQueue() {
        return new Queue("order-cooking.order-service", true);
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

    // 큐 9: 재료 등록 큐
    @Bean
    public Queue ingredientAddQueue() {
        return new Queue("ingredient-add.menu-service", true);
    }

    // 큐 10: 재료 수정 큐
    @Bean
    public Queue ingredientUpdateQueue() {
        return new Queue("ingredient-update.menu-service", true);
    }


    // 큐 11: 메뉴 등록 큐
    @Bean
    public Queue storeAddQueue() {
        return new Queue("store-add.store-service", true);
    }

    // 큐 12: 메뉴 수정 큐
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
    public Jackson2JsonMessageConverter rabbitMessageConverter(ObjectMapper mapper) {
        mapper.registerModule(new JavaTimeModule());
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        return new Jackson2JsonMessageConverter(mapper);
    }

    // RabbitAdmin으로 큐 선언 보장
    @Bean
    public RabbitAdmin rabbitAdmin() {
        RabbitAdmin rabbitAdmin = new RabbitAdmin(connectionFactory);
        // 주문 큐 등록
        rabbitAdmin.declareQueue(orderCancelledQueue());
        rabbitAdmin.declareQueue(orderCookingQueue());
        rabbitAdmin.declareQueue(statusChangeQueue());
        // 메뉴 큐 등록
        rabbitAdmin.declareQueue(menuAddQueue());
        rabbitAdmin.declareQueue(menuUpdateQueue());
        // 지점 큐 등록
        rabbitAdmin.declareQueue(storeAddQueue());
        rabbitAdmin.declareQueue(storeUpdateQueue());
        return rabbitAdmin;
    }

    // 큐 바인딩
    @Bean
    public Binding cookingBinding() {
        return BindingBuilder
                .bind(orderCookingQueue()) // order-cooking.order-service
                .to(new DirectExchange("order-cooking")) // 메시지를 보낸 exchange
                .with("#"); // 정확히 같은 routing key 사용
    }

}
