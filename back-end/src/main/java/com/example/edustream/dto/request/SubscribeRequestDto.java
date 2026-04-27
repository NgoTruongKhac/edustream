package com.example.edustream.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@AllArgsConstructor
public class SubscribeRequestDto {
    @NotBlank(message = "username is required")
    private String username;
}
