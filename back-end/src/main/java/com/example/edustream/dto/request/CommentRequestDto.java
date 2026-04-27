package com.example.edustream.dto.request;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class CommentRequestDto {
    private String content;
    private Long videoId;
    private Long userId;
}
