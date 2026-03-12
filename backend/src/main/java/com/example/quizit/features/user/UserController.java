package com.example.quizit.features.user;

import com.example.quizit.security.AppConstraint;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    @GetMapping("/admin/teachers/pending")
    @PreAuthorize("hasRole('" + AppConstraint.ADMIN_ROLE + "')")
    public ResponseEntity<List<UserDto>> getPendingTeachers() {
        return ResponseEntity.ok(userService.getUsersByRoleAndStatus("TEACHER", UserStatus.TEACHER_PENDING));
    }

    @GetMapping("/admin/teachers/approved")
    @PreAuthorize("hasRole('" + AppConstraint.ADMIN_ROLE + "')")
    public ResponseEntity<List<UserDto>> getApprovedTeachers() {
        return ResponseEntity.ok(userService.getUsersByRoleAndStatus("TEACHER", UserStatus.TEACHER_APPROVED));
    }
    @GetMapping("/admins/approved")
    @PreAuthorize("hasRole('" + AppConstraint.ADMIN_ROLE + "')")
    public ResponseEntity<List<UserDto>> getApprovedAdmins() {
        return ResponseEntity.ok(userService.getUsersByRoleAndStatus("ADMIN", UserStatus.ADMIN_APPROVED));
    }

    @PatchMapping("/admin/teachers/email/{email}/revoke")
    @PreAuthorize("hasRole('" + AppConstraint.ADMIN_ROLE + "')")
    public ResponseEntity<String> revokeTeacherAccess(@PathVariable String email) {
        // We hardcode "TEACHER" because this is the teacher-specific endpoint
        userService.revokeRoleAndUpdateStatus(email, "TEACHER", UserStatus.TEACHER_REJECTED);
        return ResponseEntity.ok("Teacher role removed and status updated to REJECTED for: " + email);
    }

    @PatchMapping("/admin/admins/email/{email}/revoke") // Changed path to /admins/ to avoid conflict
    @PreAuthorize("hasRole('" + AppConstraint.ADMIN_ROLE + "')")
    public ResponseEntity<String> revokeAdminAccess(@PathVariable String email) {
        // We hardcode "ADMIN" because this is the admin-specific endpoint
        userService.revokeRoleAndUpdateStatus(email, "ADMIN", UserStatus.ADMIN_REJECTED);
        return ResponseEntity.ok("Admin role removed and status updated to REJECTED for: " + email);
    }

    @PostMapping("/admin/teachers/approve/{email}")
    @PreAuthorize("hasRole('" + AppConstraint.ADMIN_ROLE + "')")
    public ResponseEntity<String> handleTeacherApprovalByEmail(
            @PathVariable String email,
            @RequestBody ApprovalDecisionDto decision) {
        userService.updateTeacherStatusByEmail(email, decision);
        return ResponseEntity.ok("Teacher status updated for: " + email);
    }




}
