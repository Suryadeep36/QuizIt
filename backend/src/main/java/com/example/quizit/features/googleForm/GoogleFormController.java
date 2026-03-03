package com.example.quizit.features.googleForm;

import com.example.quizit.features.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/quizit")
@RequiredArgsConstructor
public class GoogleFormController {
    private final GoogleFormService googleFormService;

    @PostMapping("/google-form-import")
    public ResponseEntity<String> importGoogleForm(@RequestBody GoogleFormRequestDto request, @AuthenticationPrincipal User user
    ) {
        String formjson  = googleFormService.importForm(request.getFormUrl(), user);
        return ResponseEntity.ok(formjson);
    }
}
