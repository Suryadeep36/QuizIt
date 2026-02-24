package com.example.quizit.features.allowedUser;


import java.util.List;
import java.util.UUID;

public interface AllowedUserSerivce {
    public AllowedUserResponse createAllowedUser(AllowedUserRequest allowedUserDto);
    public void createAllowedUserInBulk(UUID quizId, List<String> emails);
    public void deleleAllowedUserInBulk(UUID quizId, List<String> emails);
    public List<AllowedUserStatusDto> getAllAllowedUser(String quizId,UUID userId);
}
