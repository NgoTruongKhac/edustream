package com.example.edustream.dto.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CommentResponseDto {

    private Long id;
    private String content;
    private long likeCount;
    private String fullName;
    private String username;
    private String avatar;
}
