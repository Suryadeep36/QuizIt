package com.example.quizit.services;


import com.example.quizit.dtos.UserDto;
import com.example.quizit.services.interfaces.RegisterService;
import com.example.quizit.services.interfaces.UserService;
import lombok.AllArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


@Service
@AllArgsConstructor
public class RegisterServiceImpl implements RegisterService {


    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    @Override
    public UserDto registerUser(UserDto userDto) {

        //logic
        //verify email
        //verify password
        //otp

        if(userDto.getPassword() == null || userDto.getPassword().isBlank()){
            throw new IllegalArgumentException("Password is required");
        }
        userDto.setPassword(passwordEncoder.encode(userDto.getPassword()));
        UserDto user = userService.createUser(userDto);
        return user;

    }

}
