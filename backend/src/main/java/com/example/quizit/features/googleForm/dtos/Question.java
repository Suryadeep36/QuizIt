package com.example.quizit.features.googleForm.dtos;

public class Question{
    public String questionId;
    public boolean required;
    public Grading grading;
    public ChoiceQuestion choiceQuestion;
    public TextQuestion textQuestion;
    public RowQuestion rowQuestion;
    public ScaleQuestion scaleQuestion;
}
