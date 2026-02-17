package com.example.quizit.features.participant;

import com.example.quizit.dtos.ParticipantResultDTO;
import com.example.quizit.features.user.User;
import com.example.quizit.security.AppConstraint;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.access.prepost.PreAuthorize;
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

    @GetMapping("/participants/history")
    public ResponseEntity<List<ParticipantResultDTO>> getUserHistory(@AuthenticationPrincipal User user) {
        List<ParticipantResultDTO> history = participantService.getParticipantHistory(String.valueOf(user.getId()));
        return ResponseEntity.ok(history);
    }

    @GetMapping("/participants/user")
    public ResponseEntity<List<ParticipantDto>> getParticipantsByUserId(@AuthenticationPrincipal User user) {
        String userId = String.valueOf(user.getId());
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

    @PutMapping("/participant/{pid}/user/{uid}")
    public ResponseEntity<ParticipantDto> updateParticipantUserId(
            @PathVariable String pid, @PathVariable String uid) {

        return ResponseEntity.ok(participantService.addUser(pid, uid));
    }

    @DeleteMapping("/participant/{id}")
    @PreAuthorize( "hasRole('" + AppConstraint.ADMIN_ROLE+ "')" )
    public ResponseEntity<Void> deleteParticipant(@PathVariable String id) {
        participantService.deleteParticipant(id);
        return ResponseEntity.noContent().build();
    }
}
