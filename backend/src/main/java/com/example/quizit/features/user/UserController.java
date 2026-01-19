package com.example.quizit.features.user;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<Iterable<UserDto>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("users/email/{emailId}")
    public ResponseEntity<UserDto> getUserByEmail(@PathVariable String emailId) {
        return ResponseEntity.ok(userService.getUserByEmail(emailId));
    }

    @DeleteMapping("users/{uuid}")
    public void deleteUser(@PathVariable String uuid) {
        userService.deleteUser(uuid);
    }

    @PutMapping("users/{uuid}")
    public ResponseEntity<UserDto> updateUser(@PathVariable String uuid, @RequestBody UserDto userDto) {
        return ResponseEntity.ok(userService.updateUser(userDto, uuid));
    }
}
