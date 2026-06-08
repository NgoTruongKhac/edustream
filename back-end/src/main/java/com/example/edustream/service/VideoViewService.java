package com.example.edustream.service;

import com.example.edustream.config.RabbitMQConfig;
import com.example.edustream.dto.request.VideoViewBatchMessage;
import com.example.edustream.dto.request.VideoViewRequestDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.data.redis.core.Cursor;
import org.springframework.data.redis.core.ScanOptions;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class VideoViewService {

    private final StringRedisTemplate redisTemplate;
    private final RabbitTemplate rabbitTemplate;

    private static final String LOCK_KEY_FORMAT = "video:view:lock:%d:%s";
    private static final String COUNTER_KEY_FORMAT = "video:view:counter:%d";
    private static final String COUNTER_SCAN_PATTERN = "video:view:counter:*";

    public boolean processViewEvent(VideoViewRequestDto request) {
        String lockKey = String.format(LOCK_KEY_FORMAT, request.getVideoId(), request.getUserIdentifier());

        Boolean isNewView = redisTemplate.opsForValue().setIfAbsent(lockKey, "1", 24, TimeUnit.HOURS);

        if (Boolean.TRUE.equals(isNewView)) {
            String counterKey = String.format(COUNTER_KEY_FORMAT, request.getVideoId());
            redisTemplate.opsForValue().increment(counterKey);
            return true;
        }
        return false;
    }

    @Scheduled(fixedRate = 5000) // 10000ms = 10 giây
    public void pushViewsToRabbitMQ() {
        Map<Long, Long> batchMap = new HashMap<>();

        ScanOptions options = ScanOptions.scanOptions().match(COUNTER_SCAN_PATTERN).count(100).build();
        Cursor<String> cursor = redisTemplate.scan(options);

        while (cursor.hasNext()) {
            String counterKey = cursor.next();
            try {
                String rawVideoId = counterKey.replace("video:view:counter:", "");
                Long videoId = Long.parseLong(rawVideoId);

                String viewsStr = redisTemplate.opsForValue().getAndDelete(counterKey);

                if (viewsStr != null) {
                    long viewsCount = Long.parseLong(viewsStr);
                    if (viewsCount > 0) {
                        batchMap.put(videoId, viewsCount);
                    }
                }
            } catch (Exception e) {
                log.error("Lỗi khi xử lý key tích lũy view: {}", counterKey, e);
            }
        }
        cursor.close();

        if (!batchMap.isEmpty()) {
            log.info("Bắn cụm (Batch) dữ liệu view sang RabbitMQ với {} videos", batchMap.size());
            VideoViewBatchMessage message = new VideoViewBatchMessage(batchMap);
            rabbitTemplate.convertAndSend(RabbitMQConfig.VIEW_EXCHANGE, RabbitMQConfig.VIEW_ROUTING_KEY, message);
        }
    }
}