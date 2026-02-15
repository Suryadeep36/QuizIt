package com.example.quizit.features.user;

import com.example.quizit.security.AppConstraint;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RequestMapping("/quizit")
@RestController
@RequiredArgsConstructor
public class UserController {

    private final UserServiceImpl userService;


    @PostMapping("user")
    public ResponseEntity<UserDto> createUser(@RequestBody UserDto userDto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.createUser(userDto));
    }

    @GetMapping("users")
    @PreAuthorize( "hasRole('" + AppConstraint.ADMIN_ROLE+ "')" )
    public ResponseEntity<Iterable<UserDto>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("users/email/{emailId}")
    public ResponseEntity<UserDto> getUserByEmail(@PathVariable String emailId) {
        return ResponseEntity.ok(userService.getUserByEmail(emailId));
    }

    @PreAuthorize( "hasRole('" + AppConstraint.ADMIN_ROLE+ "')" )
    @DeleteMapping("users/{uuid}")
    public void deleteUser(@PathVariable String uuid) {
        userService.deleteUser(uuid);
    }

    @PutMapping("users")
    public ResponseEntity<UserDto> updateUser(@RequestBody UserDto userDto, @AuthenticationPrincipal  User user) {
        String userId = String.valueOf(user.getId());
        return ResponseEntity.ok(userService.updateUser(userDto, userId));
    }
}
