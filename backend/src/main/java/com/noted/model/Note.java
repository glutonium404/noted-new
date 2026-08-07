package com.noted.model;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;

import java.util.ArrayList;
import java.util.List;

/**
 * A single note belonging to a user, now its own "notes" table with a
 * foreign key back to the owning user (previously stored inline inside
 * the user's JSON record).
 */
@Entity
@Table(name = "notes")
public class Note {

    @Id
    private String id;

    @Column(nullable = false, length = 80)
    private String title;

    @Column(nullable = false, length = 5000)
    private String body;

    @Column(nullable = false)
    private String createdAt;

    private String updatedAt; // null until the note has been edited at least once

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "note_tags", joinColumns = @JoinColumn(name = "note_id"))
    @OrderColumn(name = "tag_order")
    @Column(name = "tag", length = 20)
    private List<String> tags = new ArrayList<>();

    private String color;

    @Column(nullable = false)
    private boolean pinned = false;

    // Null when the note is not shared. Set to a random public token when
    // the owner turns sharing on; anyone with this token can view the note
    // read-only via GET /api/notes/shared/{shareId} without logging in.
    @Column(name = "share_id", unique = true)
    private String shareId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    public Note() {
        this.tags = new ArrayList<>();
    }

    public Note(String id, String title, String body, String createdAt, String updatedAt) {
        this(id, title, body, createdAt, updatedAt, new ArrayList<>(), null);
    }

    public Note(String id, String title, String body, String createdAt, String updatedAt, List<String> tags, String color) {
        this.id = id;
        this.title = title;
        this.body = body;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.tags = tags != null ? tags : new ArrayList<>();
        this.color = color;
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
        this.tags = tags != null ? tags : new ArrayList<>();
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
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
