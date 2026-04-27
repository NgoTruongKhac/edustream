package com.example.edustream.service;

import com.example.edustream.dto.request.SubscribeRequestDto;
import com.example.edustream.dto.response.PageResponse;
import com.example.edustream.dto.response.UserResponseDto;
import com.example.edustream.entity.Subscription;
import com.example.edustream.entity.User;
import com.example.edustream.entity.UserPrincipal;
import com.example.edustream.exception.UserNotFoundException;
import com.example.edustream.mapper.UserMapper;
import com.example.edustream.repository.SubscriptionRepository;
import com.example.edustream.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @Transactional
    public void subscribe(UserPrincipal userPrincipal, SubscribeRequestDto subscribeRequestDto) {
        User subscriber = userPrincipal.getUser();
        String targetUsername = subscribeRequestDto.getUsername();

        if (subscriber.getUsername().equals(targetUsername)) {
            // Bạn có thể thay bằng Custom Exception của dự án (VD: BadRequestException)
            throw new IllegalArgumentException("Bạn không thể tự đăng ký kênh của chính mình.");
        }

        // 3. Tìm kiếm kênh (User) muốn đăng ký trong DB
        User channel = userRepository.findByUsername(targetUsername)
                .orElseThrow(() -> new UserNotFoundException("Không tìm thấy người dùng với username: " + targetUsername));

        if (subscriptionRepository.existsBySubscriberAndChannel(subscriber, channel)) {
             return;

        }

        Subscription subscription = new Subscription();
        subscription.setSubscriber(subscriber);
        subscription.setChannel(channel);

        subscriptionRepository.save(subscription);
    }
    @Transactional
    public void unsubscribe(UserPrincipal userPrincipal, SubscribeRequestDto dto) {
        User subscriber = userPrincipal.getUser();
        String targetUsername = dto.getUsername();

        // 1. Không cho tự thao tác
        if (subscriber.getUsername().equals(targetUsername)) {
            throw new IllegalArgumentException("Không hợp lệ.");
        }

        // 2. Tìm channel
        User channel = userRepository.findByUsername(targetUsername)
                .orElseThrow(() -> new UserNotFoundException(
                        "Không tìm thấy người dùng với username: " + targetUsername));

        if (!subscriptionRepository.existsBySubscriberAndChannel(subscriber, channel)) {
            return;
        }

        subscriptionRepository.deleteBySubscriberAndChannel(subscriber, channel);
    }

    @Transactional(readOnly = true)
    public boolean checkSubscription(UserPrincipal userPrincipal, String targetUsername) {
        User subscriber = userPrincipal.getUser();

        // Tránh lỗi nếu check chính mình
        if (subscriber.getUsername().equals(targetUsername)) {
            return false;
        }

        User channel = userRepository.findByUsername(targetUsername)
                .orElseThrow(() -> new UserNotFoundException("Không tìm thấy người dùng với username: " + targetUsername));

        return subscriptionRepository.existsBySubscriberAndChannel(subscriber, channel);
    }

    @Transactional(readOnly = true) // Đánh dấu readOnly để tối ưu hiệu suất đọc
    public PageResponse<UserResponseDto> getSubscriptions(UserPrincipal userPrincipal, int page) {
        User currentUser = userPrincipal.getUser();

        int pageSize = 10;
        Pageable pageable = PageRequest.of(page, pageSize);

        Page<User> channelsPage = subscriptionRepository.findSubscribedChannels(currentUser, pageable);

        Page<UserResponseDto> dtoPage = channelsPage.map(userMapper::toUserResponseDto);

        return new PageResponse<>(dtoPage);
    }

}