package com.noted.service;

import com.noted.dto.LoginRequest;
import com.noted.dto.RegisterRequest;
import com.noted.dto.UserResponse;
import com.noted.exception.ApiException;
import com.noted.model.User;
import com.noted.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserResponse register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        String username = request.getUsername().trim().toLowerCase();

        if (userRepository.findByEmailIgnoreCase(email).isPresent()) {
            throw new ApiException(HttpStatus.CONFLICT, "email_taken", "An account with that email already exists.");
        }
        if (userRepository.findByUsernameIgnoreCase(username).isPresent()) {
            throw new ApiException(HttpStatus.CONFLICT, "username_taken", "That username is already taken.");
        }

        // Demo project: no hashing, no encryption — password is stored exactly
        // as submitted, in plain text, in the database.
        User user = new User(
                UUID.randomUUID().toString(),
                request.getName().trim(),
                email,
                username,
                request.getPassword());

        userRepository.save(user);
        return UserResponse.from(user);
    }

    public UserResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.UNAUTHORIZED, "invalid_credentials", "Incorrect email or password."));

        if (!user.getPassword().equals(request.getPassword())) {
            throw new ApiException(
                    HttpStatus.UNAUTHORIZED, "invalid_credentials", "Incorrect email or password.");
        }

        return UserResponse.from(user);
    }
}
