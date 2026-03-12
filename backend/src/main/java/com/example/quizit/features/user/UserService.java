package com.example.quizit.features.user;


import java.util.List;
import java.util.UUID;

public interface UserService {


    UserDto createUser(UserDto userDto);

    UserDto updateUser(UserDto userDto);
    UserDto updateUser(UserDto userDto, String id);

    UserDto getUserByEmail(String email);
    UserDto getUserById(String id);
    void deleteUser(String uuid);

    Iterable<UserDto> getAllUsers();
    List<UserDto> getUsersByRoleAndStatus(String roleName, UserStatus status);
    public void updateTeacherStatusByEmail(String email, ApprovalDecisionDto decision);
    public void revokeRoleAndUpdateStatus(String email, String roleName,UserStatus status);
    public void grantRoleAndUpdateStatus(String email, String roleName, UserStatus status);
}
