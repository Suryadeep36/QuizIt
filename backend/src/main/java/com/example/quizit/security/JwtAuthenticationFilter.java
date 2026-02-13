package com.example.quizit.security;

import com.example.quizit.features.user.UserRepository;
import io.jsonwebtoken.*;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;


@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        log.info("Authorization header received: " + header);
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);


            try{

                if(!jwtService.isAccessToken(token)){
                    filterChain.doFilter(request,response);
                    return;
                }

                Jws<Claims> parsedToken =  jwtService.parse(token);
               Claims payload = parsedToken.getPayload();
                UUID userId = UUID.fromString(payload.getSubject());

                userRepository.findById(userId)
                        .ifPresent(user -> {

                            if(user.isEnabled()) {
                                List<GrantedAuthority> authorities = user.getRoles() == null ? List.of() :
                                        user.getRoles().stream().map(role -> new SimpleGrantedAuthority(role.getName())).collect(Collectors.toList());

                                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                                        user,
                                        null,
                                        authorities
                                );
                                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));


                                SecurityContextHolder.getContext().setAuthentication(authentication);
                            }
                        });

            }
            catch (ExpiredJwtException e) {
                request.setAttribute("errException", "token expired");
                System.out.println("token expired");
                logger.error("token expired", e);
            }
            catch(Exception e){
                request.setAttribute("errException", "token invalid");
            }
        }
        filterChain.doFilter(request, response);


    }


    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String uri = request.getRequestURI();
        return uri.startsWith("/quizit/login")
                || uri.startsWith("/quizit/register")
                || uri.startsWith("/quizit/logout")
                || uri.startsWith("/quizit/refresh");
    }


}
