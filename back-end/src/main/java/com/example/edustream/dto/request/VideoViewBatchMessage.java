package com.example.edustream.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class VideoViewBatchMessage implements Serializable {
    // Map chứa cấu trúc: Key = VideoId, Value = Số view cần cộng thêm (ví dụ: {1: 100, 2: 45})
    private Map<Long, Long> videoViewsMap;
}