package com.noted.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;

public class NoteRequest {

    private static final String TAG_PATTERN = "^\\S+$";
    private static final String HEX_COLOR_PATTERN = "^$|^#[0-9a-fA-F]{6}$";

    @NotBlank(message = "is required")
    @Size(max = 80, message = "must be 80 characters or fewer")
    private String title;

    @NotBlank(message = "is required")
    @Size(max = 5000, message = "must be 5000 characters or fewer")
    private String body;

    @Size(max = 20, message = "must contain 20 tags or fewer")
    private List<
            @Size(max = 20, message = "tag must be 20 characters or fewer")
            @Pattern(regexp = TAG_PATTERN, message = "tag must be a single word")
            String> tags;

    @Pattern(regexp = HEX_COLOR_PATTERN, message = "color must be a 6-digit hex like #baff29")
    private String color;

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
