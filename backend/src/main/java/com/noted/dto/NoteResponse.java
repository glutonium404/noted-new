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
    private boolean pinned;
    // Null when the note isn't shared. Non-null means it's publicly viewable
    // (read-only, no login required) at /api/notes/shared/{shareId} — the
    // frontend can build the share link directly from this value.
    private String shareId;

    public NoteResponse() {
    }

    public NoteResponse(String id, String title, String body, String createdAt, String updatedAt, List<String> tags, String color, boolean pinned, String shareId) {
        this.id = id;
        this.title = title;
        this.body = body;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.tags = tags;
        this.color = color;
        this.pinned = pinned;
        this.shareId = shareId;
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
            note.getColor(),
            note.isPinned(),
            note.getShareId());
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

    public boolean isPinned() {
        return pinned;
    }

    public void setPinned(boolean pinned) {
        this.pinned = pinned;
    }

    public String getShareId() {
        return shareId;
    }

    public void setShareId(String shareId) {
        this.shareId = shareId;
    }
}
