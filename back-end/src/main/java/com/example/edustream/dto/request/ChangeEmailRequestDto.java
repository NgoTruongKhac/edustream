package com.example.edustream.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class ChangeEmailRequestDto {

    @NotBlank(message = "email is required")
    @Email(message = "email is invalid")
    private String newEmail;
}
