package com.example.quizit.controllers;

import com.example.quizit.dtos.ParticipantDto;
import com.example.quizit.services.interfaces.ParticipantService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/quizit")
@RequiredArgsConstructor
public class ParticipantController {

    private final ParticipantService participantService;

    @GetMapping("/participant/{id}")
    public ResponseEntity<ParticipantDto> getParticipantById(@PathVariable String id) {
        return ResponseEntity.ok(participantService.getParticipantById(id));
    }

    @GetMapping("/participants/quiz/{quizId}")
    public ResponseEntity<List<ParticipantDto>> getParticipantsByQuizId(@PathVariable String quizId) {
        return ResponseEntity.ok(participantService.getParticipantByQuizId(quizId));
    }

    @GetMapping("/participants/user/{userId}")
    public ResponseEntity<List<ParticipantDto>> getParticipantsByUserId(@PathVariable String userId) {
        return ResponseEntity.ok(participantService.getParticipantByUserId(userId));
    }

    @PostMapping("/participant")
    public ResponseEntity<ParticipantDto> createParticipant(@RequestBody ParticipantDto participantDto) {
//        System.out.println(participantDto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(participantService.createParticipant(participantDto));
    }

    @PutMapping("/participant/{id}")
    public ResponseEntity<ParticipantDto> updateParticipant(
            @PathVariable String id,
            @RequestBody ParticipantDto participantDto) {

        return ResponseEntity.ok(participantService.updateParticipant(id, participantDto));
    }

    @DeleteMapping("/participant/{id}")
    public ResponseEntity<Void> deleteParticipant(@PathVariable String id) {
        participantService.deleteParticipant(id);
        return ResponseEntity.noContent().build();
    }
}
