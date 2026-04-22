package com.example.edustream.exception;

public class UsernameChangeCooldownException extends RuntimeException {
    public UsernameChangeCooldownException(String message) {
        super(message);
    }
}
