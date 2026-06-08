package com.example.edustream.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VideoFilterRequestDto {
    private String category;
    private int page = 0;
    private int size = 10;
    private String sortBy = "newest";

}