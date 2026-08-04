package com.noted.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class NoteAskRequest {

    @NotBlank(message = "is required")
    @Size(max = 500, message = "must be 500 characters or fewer")
    private String question;

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }
}
