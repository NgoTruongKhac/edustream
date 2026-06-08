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
    private Map<Long, Long> videoViewsMap;
}