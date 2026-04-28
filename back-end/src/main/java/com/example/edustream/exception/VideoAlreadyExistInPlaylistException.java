package com.example.edustream.exception;

public class VideoAlreadyExistInPlaylistException extends RuntimeException {
    public VideoAlreadyExistInPlaylistException(String message) {
        super(message);
    }
}
