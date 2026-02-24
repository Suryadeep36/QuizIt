package com.example.quizit.features.registeredUser;


import lombok.*;

@Setter
@Getter
@AllArgsConstructor
@Builder
@NoArgsConstructor
@ToString
public class RegistrationRequestDto {
    private String name;
    private String email;
    private String birthDate;
    private String entrollmenId;
    private String registrationToken;

}
