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

    // 조리중 큐
    @Bean
    public Queue orderCookingQueue() {
        return new Queue("order-cooking.order-service", true);
    }

    // 큐 11: status 변경 큐
    @Bean
    public Queue statusChangeQueue() {
        return new Queue("status-change.order-service", true);
    }

    // 큐 12: 롤백 큐
    @Bean
    public Queue orderRollbackQueue() { return new Queue("order-rollback.order-service", true);}

    @Bean
    public Jackson2JsonMessageConverter rabbitMessageConverter(ObjectMapper mapper) {
        mapper.registerModule(new JavaTimeModule());
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        return new Jackson2JsonMessageConverter(mapper);
    }


    @Bean
    public DirectExchange orderCookingExchange() {
        return new DirectExchange("order-cooking", true, false);
    }

    @Bean
    public DirectExchange orderRollbackExchange() {
        return new DirectExchange("order-rollback", true, false);
    }

    // 큐 바인딩
    @Bean
    public Binding cookingBinding() {
        return BindingBuilder
                .bind(orderCookingQueue()) // order-cooking.order-service
                .to(orderCookingExchange()) // 메시지를 보낸 exchange
                .with("#"); // 정확히 같은 routing key 사용
    }

    // 롤백 바인딩
    @Bean
    public Binding rollbackBinding() {
        return BindingBuilder
                .bind(orderRollbackQueue())
                .to(orderRollbackExchange())
                .with("#"); // 메시지 routing key 와 정확히 일치
    }

    // RabbitAdmin으로 큐 선언 보장
    @Bean
    public RabbitAdmin rabbitAdmin() {
        RabbitAdmin rabbitAdmin = new RabbitAdmin(connectionFactory);
        // 주문 큐 등록
        rabbitAdmin.declareQueue(orderCookingQueue());
        rabbitAdmin.declareQueue(statusChangeQueue());
        rabbitAdmin.declareQueue(orderRollbackQueue());
        return rabbitAdmin;
    }

}
