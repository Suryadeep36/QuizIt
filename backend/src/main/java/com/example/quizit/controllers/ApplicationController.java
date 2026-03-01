package com.example.quizit.controllers;


import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/quizit")
public class ApplicationController {

    @GetMapping("")
    public ResponseEntity<String> home() {
        System.out.printf("HELLO WORLD");
        return ResponseEntity.ok("Application Controller Running!");
    }

    @GetMapping("/health")
    public ResponseEntity<String> getHealth(){
        return ResponseEntity.ok("QuizIt is running!");
    }
}
