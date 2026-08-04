package com.noted.exception;

import org.springframework.http.HttpStatus;

/**
 * Thrown by services/controllers for any expected error condition
 * (validation failure, duplicate email, bad credentials, missing note...).
 * Caught by {@link GlobalExceptionHandler} and turned into the ApiError
 * JSON shape the frontend expects: { status, code, message }.
 */
public class ApiException extends RuntimeException {

    private final HttpStatus status;
    private final String code;

    public ApiException(HttpStatus status, String code, String message) {
        super(message);
        this.status = status;
        this.code = code;
    }

    public HttpStatus getStatus() {
        return status;
    }

    public String getCode() {
        return code;
    }
}
