package com.example.quizit.controllers;


import com.example.quizit.features.user.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/quizit")
public class ApplicationController {

    private final UserRepository userRepository;

    public ApplicationController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("")
    public ResponseEntity<String> home() {
        System.out.printf("HELLO WORLD");
        return ResponseEntity.ok("Application Controller Running!");
    }

    @GetMapping("/health")
    public ResponseEntity<String> getHealth(){

        userRepository.findByEmail("For db health");
        return ResponseEntity.ok("QuizIt is running!");
    }
}
