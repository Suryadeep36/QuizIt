package com.example.quizit.features.quiz;

import com.example.quizit.features.allowedUser.InvitationService;
import com.example.quizit.features.registeredUser.SendJoinLinkService;
import com.example.quizit.features.user.User;
import com.example.quizit.security.AppConstraint;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.parameters.P;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;


@RequestMapping("/quizit")
@RestController
@RequiredArgsConstructor
public class QuizController {
    private final QuizService quizService;
    private final InvitationService invitationService;
    private final SendJoinLinkService sendJoinLinkService;

    @GetMapping("/quiz")
    @PreAuthorize( "hasRole('" + AppConstraint.ADMIN_ROLE+ "')" )
    public ResponseEntity<List<QuizDto>> getAllQuizs(Authentication authentication){
        return ResponseEntity.status(200).body(quizService.getAllQuizzes());
    }

    @GetMapping("/quiz/{quizId}")
    public ResponseEntity<QuizDto> getQuizById(@PathVariable String quizId ,Authentication authentication){
        User user = (User) authentication.getPrincipal();
        UUID userId = user.getId();
        return ResponseEntity.status(200).body(quizService.getQuizById(quizId,userId));
    }

    @GetMapping("/quizForParticipant/{quizId}")
    public ResponseEntity<QuizDtoForParticipant> getQuizForParticipantById(@PathVariable String quizId){
        return ResponseEntity.status(200).body(quizService.getQuizForParticipantById(quizId));
    }

//    @PreAuthorize( "hasRole('" + AppConstraint.ADMIN_ROLE+ "')" )
    @GetMapping("/quiz/host")
    public ResponseEntity<List<QuizDto>> getQuizsByHostId( Authentication  authentication){
        User user = (User) authentication.getPrincipal();
        UUID userId = user.getId();
        String hostId = String.valueOf(userId);
        return ResponseEntity.status(200).body(quizService.getQuizzesByHost(hostId));
    }

    @PostMapping("/quiz")
    public ResponseEntity<QuizDto> createQuiz(@RequestBody QuizDto quizDto, Authentication  authentication){
        User user = (User) authentication.getPrincipal();
        UUID userId = user.getId();
        return ResponseEntity.status(200).body(quizService.createQuiz(quizDto,userId));
    }

    @PutMapping("/quiz/{quizId}")
    public ResponseEntity<QuizDto> updateQuiz(@PathVariable String quizId, @RequestBody QuizDto quizDto, Authentication  authentication){
        User user = (User) authentication.getPrincipal();
        UUID userId = user.getId();
        return ResponseEntity.status(200).body(quizService.updateQuiz(quizId, quizDto,userId));
    }

    @DeleteMapping("/quiz/{quizId}")
    public ResponseEntity<Void> deleteQuiz(@PathVariable String quizId, Authentication  authentication){
        User user = (User) authentication.getPrincipal();
        UUID userId = user.getId();
        quizService.deleteQuiz(quizId, userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/quiz/{quizId}/invitations/send-all")
    public ResponseEntity<Void> sendAllEmail(@PathVariable UUID quizId, Authentication authentication){
        User user = (User) authentication.getPrincipal();
        UUID userId = user.getId();
        invitationService.sendAllEmail(quizId, userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/quiz/{quizId}/invitations/{allowedUserId}/send")
    public ResponseEntity<Void> sendOneEmail(@PathVariable UUID quizId, @PathVariable UUID allowedUserId, Authentication authentication){
        User user = (User) authentication.getPrincipal();
        UUID userId = user.getId();
        invitationService.sendOneEmail(quizId, allowedUserId, userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/quiz/{quizId}/join-link/send-all")
    public ResponseEntity<Void> sendJoinLinkAll(@PathVariable UUID quizId,Authentication authentication){
        User user = (User) authentication.getPrincipal();
        UUID userId = user.getId();
        sendJoinLinkService.sendJoinLinkAll(quizId, userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/quiz/{quizId}/end-early")
    public ResponseEntity<Void> endQuizEarly(@PathVariable UUID quizId, Authentication authentication){
        User user = (User) authentication.getPrincipal();
        UUID userId = user.getId();
        quizService.endQuizEarlyByHost(quizId, userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/quiz/{quizId}/publish-result")
    public ResponseEntity<Void> publishResult(@PathVariable UUID quizId, Authentication authentication){
        User user = (User) authentication.getPrincipal();
        UUID userId = user.getId();
        quizService.publishResult(quizId, userId);
        return ResponseEntity.noContent().build();
    }

}
