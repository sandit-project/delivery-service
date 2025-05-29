package com.example.deliveryservice.config;

import org.redisson.Redisson;
import org.redisson.config.Config;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.redisson.api.RedissonClient;

@Configuration
public class RedissonConfig {

    @Value("${spring.data.redis.host}")
    private String host;

    @Value("${spring.data.redis.port}")
    private String port;

    @Value("${spring.data.redis.password}")
    private String password;

    @Value("${spring.data.redis.username}")
    private String username;

    @Bean
    public RedissonClient redissonClient() {
        Config config = new Config();

        String redisUrl = "redis://" + host + ":" + port;

        var singleServerConfig = config.useSingleServer()
                .setAddress(redisUrl);

        if (password != null && !password.isBlank()) {
            singleServerConfig.setPassword(password);
        }

        if (username != null && !username.isBlank()) {
            singleServerConfig.setUsername(username);
        }

        return Redisson.create(config);
    }
}
