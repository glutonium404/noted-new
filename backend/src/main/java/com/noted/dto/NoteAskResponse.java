package com.noted.dto;

public class NoteAskResponse {
    private String answer;

    public NoteAskResponse() {
    }

    public NoteAskResponse(String answer) {
        this.answer = answer;
    }

    public String getAnswer() {
        return answer;
    }

    public void setAnswer(String answer) {
        this.answer = answer;
    }
}
