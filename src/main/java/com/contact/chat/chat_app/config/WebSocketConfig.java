package com.contact.chat.chat_app.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {




    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
       config.enableSimpleBroker("/test");
       // clent            //  /test/

        config.setApplicationDestinationPrefixes("/app");

        // /app/chat
        //  server side : massageMappign("/chat")
    }


    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {

      registry.addEndpoint("/chat")
              .setAllowedOrigins("http://localhost:8080")
              .withSockJS();
//  /chat end point par connection establish hoga
    }
}
