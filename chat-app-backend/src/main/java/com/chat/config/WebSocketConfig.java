package com.chat.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        //Adding the endpoints and the Origin
        registry.addEndpoint("/chat")
                .setAllowedOriginPatterns("http://localhost:8080")
                .withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        //Set the Message Broker (whoever subscribe this channel get to the //topic/chatRoom -> Get to message)
        registry.enableSimpleBroker("/topic");
        //expect message with //app/sendmessage
        registry.setApplicationDestinationPrefixes("/app");
    }
}
