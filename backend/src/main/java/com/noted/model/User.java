package com.noted.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * A user record, now backed by a real "users" table (SQLite) instead of
 * the old db.json file.
 *
 * This is still a demo project with no session management or encryption:
 * the password is kept in plain text, exactly as the user typed it. Never
 * return this object directly from a controller — always map it to
 * {@code UserResponse} first so the password field doesn't leak over the
 * wire.
 */
@Entity
@Table(name = "users")
public class User {

    @Id
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String password;

    public User() {
    }

    public User(String id, String name, String email, String username, String password) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.username = username;
        this.password = password;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
