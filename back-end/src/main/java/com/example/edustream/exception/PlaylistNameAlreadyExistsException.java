package com.example.edustream.exception;

public class PlaylistNameAlreadyExistsException extends RuntimeException {
    public PlaylistNameAlreadyExistsException(String message) {
        super(message);
    }
}
