package com.example.quizit.features.googleForm.dtos;


import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Data
@Setter
@Getter
public class GoogleFormRequestDto {
    private String formUrl;
    private UUID quizId;
}
