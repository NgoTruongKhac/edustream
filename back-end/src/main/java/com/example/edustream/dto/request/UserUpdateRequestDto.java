package com.example.edustream.dto.request;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserUpdateRequestDto {

    @Size(min = 3, max = 20, message = "full name length from 3 to 20 characters")
    private String fullName;

    private String username;

    @Size(min = 3, message = "description length lest  3 characters")
    private String description;

}
