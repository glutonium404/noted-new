package com.noted.dto;

import com.noted.model.User;

/**
 * What we actually send back for a user — no password field, ever.
 */
public class UserResponse {

    private String name;
    private String email;
    private String username;

    public UserResponse() {
    }

    public UserResponse(String name, String email, String username) {
        this.name = name;
        this.email = email;
        this.username = username;
    }

    public static UserResponse from(User user) {
        return new UserResponse(user.getName(), user.getEmail(), user.getUsername());
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }
}
