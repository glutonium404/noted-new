package com.noted.dto;

import com.noted.model.Note;

import java.util.List;
import java.util.ArrayList;

public class NoteResponse {

    private String id;
    private String title;
    private String body;
    private String createdAt;
    private String updatedAt;
    private List<String> tags;
    private String color;

    public NoteResponse() {
    }

    public NoteResponse(String id, String title, String body, String createdAt, String updatedAt, List<String> tags, String color) {
        this.id = id;
        this.title = title;
        this.body = body;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.tags = tags;
        this.color = color;
    }

    public static NoteResponse from(Note note) {
        List<String> safeTags = (note.getTags() == null) 
        ? List.of()
        : new ArrayList<>(note.getTags());

        return new NoteResponse(
            note.getId(),
            note.getTitle(),
            note.getBody(),
            note.getCreatedAt(),
            note.getUpdatedAt(),
            safeTags,
            note.getColor());
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getBody() {
        return body;
    }

    public void setBody(String body) {
        this.body = body;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public String getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(String updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }
}
