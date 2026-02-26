package com.example.quizit.features.registeredUser;


import com.example.quizit.features.user.User;
import org.springframework.web.bind.annotation.RequestBody;

public interface RegisteredUserService {
    RegisteredUserDto registerUser(@RequestBody RegisteredUserDto registeredUserDto, User user, String userAgent, String ipaddress);
    CheckStatusDto checkStatus(String token,User user);
}
