package com.example.edustream.service;

import com.example.edustream.config.RabbitMQConfig;
import com.example.edustream.dto.request.VideoViewBatchMessage;
import com.example.edustream.repository.VideoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class VideoViewConsumer {

    private final VideoRepository videoRepository;

    @RabbitListener(queues = RabbitMQConfig.VIEW_QUEUE)
    @Transactional
    public void handleVideoViewBatch(VideoViewBatchMessage message) {
        if (message.getVideoViewsMap() == null || message.getVideoViewsMap().isEmpty()) {
            return;
        }

        log.info("Consumer bắt đầu cập nhật Batch Write cho {} videos từ RabbitMQ", message.getVideoViewsMap().size());

        // Lặp qua Map để thực thi UPDATE hàng loạt vào DB
        message.getVideoViewsMap().forEach((videoId, viewsToAdd) -> {
            try {
                videoRepository.batchIncrementVideoView(videoId, viewsToAdd);
                log.info("Video ID {}: Đã cộng dồn thành công +{} views vào DB.", videoId, viewsToAdd);
            } catch (Exception e) {
                log.error("Thất bại khi cập nhật view cho video ID: {}", videoId, e);
            }
        });
    }
}