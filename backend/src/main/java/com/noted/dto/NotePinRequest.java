package com.noted.dto;

import jakarta.validation.constraints.NotNull;

public class NotePinRequest {

    @NotNull(message = "is required")
    private Boolean pinned;

    public Boolean getPinned() {
        return pinned;
    }

    public void setPinned(Boolean pinned) {
        this.pinned = pinned;
    }
}
