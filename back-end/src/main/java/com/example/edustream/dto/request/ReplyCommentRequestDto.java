package com.example.edustream.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReplyCommentRequestDto {
    @NotBlank(message = "Nội dung không được để trống")
    private String content;

    @NotNull(message = "Video ID không được để trống")
    private Long videoId;

    @NotNull(message = "Parent Comment ID không được để trống")
    private Long parentId;
}