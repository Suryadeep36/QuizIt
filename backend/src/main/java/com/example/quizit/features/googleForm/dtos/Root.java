package com.example.quizit.features.googleForm.dtos; 
import java.util.List;

public class Root{
    public String formId;
    public Info info;
    public Settings settings;
    public String revisionId;
    public String responderUri;
    public List<Item> items;
    public String linkedSheetId;
    public PublishSettings publishSettings;
}
