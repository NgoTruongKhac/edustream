package com.example.edustream.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VideoFilterRequestDto {
    private String category;
    private int page = 0;
    private int size = 10; // Có thể mở rộng cho phép client chọn số lượng item mỗi trang
    private String sortBy = "newest";

}