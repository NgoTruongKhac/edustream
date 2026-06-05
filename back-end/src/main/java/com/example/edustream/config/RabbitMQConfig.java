package com.example.edustream.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String VIEW_QUEUE = "video.view.queue";
    public static final String VIEW_EXCHANGE = "video.view.exchange";
    public static final String VIEW_ROUTING_KEY = "video.view.routingKey";

    @Bean
    public Queue viewQueue() {
        return new Queue(VIEW_QUEUE, true);
    }

    @Bean
    public TopicExchange viewExchange() {
        return new TopicExchange(VIEW_EXCHANGE);
    }

    @Bean
    public Binding viewBinding(Queue viewQueue, TopicExchange viewExchange) {
        return BindingBuilder.bind(viewQueue).to(viewExchange).with(VIEW_ROUTING_KEY);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}