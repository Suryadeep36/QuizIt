package com.example.quizit.security;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    private final JwtService jwtService;
    private static final String AUTH_ATTR = "auth";

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor == null) return message;

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            String authHeader = accessor.getFirstNativeHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ") && !authHeader.contains("null")) {
                try {
                    String token = authHeader.substring(7);
                    Authentication authentication = jwtService.buildAuthentication(token);

                    // Set the user in the accessor so Spring knows who this is
                    accessor.setUser(authentication);

                    if (accessor.getSessionAttributes() != null) {
                        accessor.getSessionAttributes().put(AUTH_ATTR, authentication);
                    }
                } catch (Exception e) {
                    // If token is invalid, you can either let them connect as GUEST
                    // or throw an AccessDeniedException to block them.
                    System.out.println(e.getMessage());
                    return null;
                }
            }
        }
        // For non-CONNECT messages, try to restore the user from the session
        else if (accessor.getSessionAttributes() != null) {
            Authentication authentication = (Authentication) accessor.getSessionAttributes().get(AUTH_ATTR);
            if (authentication != null) {
                accessor.setUser(authentication);
            }
        }

        return message;
    }
}