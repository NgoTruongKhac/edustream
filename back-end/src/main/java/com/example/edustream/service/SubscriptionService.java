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
            throw new IllegalArgumentException("Bạn không thể tự đăng ký kênh của chính mình.");
        }

        User channel = userRepository.findByUsername(targetUsername)
                .orElseThrow(() -> new UserNotFoundException("Không tìm thấy người dùng: " + targetUsername));

        if (subscriptionRepository.existsBySubscriberAndChannel(subscriber, channel)) {
            return;
        }

        // Lưu subscription
        Subscription subscription = new Subscription();
        subscription.setSubscriber(subscriber);
        subscription.setChannel(channel);
        subscriptionRepository.save(subscription);

        // Cập nhật số lượng người đăng ký cho channel
        channel.setSubscribersCount(channel.getSubscribersCount() + 1);
        userRepository.save(channel);
    }

    @Transactional
    public void unsubscribe(UserPrincipal userPrincipal, SubscribeRequestDto dto) {
        User subscriber = userPrincipal.getUser();
        String targetUsername = dto.getUsername();

        User channel = userRepository.findByUsername(targetUsername)
                .orElseThrow(() -> new UserNotFoundException("Không tìm thấy người dùng: " + targetUsername));

        if (!subscriptionRepository.existsBySubscriberAndChannel(subscriber, channel)) {
            return;
        }

        subscriptionRepository.deleteBySubscriberAndChannel(subscriber, channel);

        // Giảm số lượng người đăng ký (đảm bảo không âm)
        long currentCount = channel.getSubscribersCount();
        channel.setSubscribersCount(Math.max(0, currentCount - 1));
        userRepository.save(channel);
    }

    @Transactional(readOnly = true)
    public PageResponse<UserResponseDto> getMySubscribers(UserPrincipal userPrincipal, int page) {
        User currentUser = userPrincipal.getUser();
        Pageable pageable = PageRequest.of(page, 10);

        Page<User> subscribersPage = subscriptionRepository.findSubscribersByChannel(currentUser, pageable);

        return new PageResponse<>(subscribersPage.map(userMapper::toUserResponseDto));
    }

    @Transactional(readOnly = true)
    public PageResponse<UserResponseDto> getSubscriptions(UserPrincipal userPrincipal, int page) {
        User currentUser = userPrincipal.getUser();
        Pageable pageable = PageRequest.of(page, 10);

        Page<User> channelsPage = subscriptionRepository.findSubscribedChannels(currentUser, pageable);

        return new PageResponse<>(channelsPage.map(userMapper::toUserResponseDto));
    }

    @Transactional(readOnly = true)
    public boolean checkSubscription(UserPrincipal userPrincipal, String targetUsername) {
        User subscriber = userPrincipal.getUser();

        if (subscriber.getUsername().equals(targetUsername)) {
            return false;
        }

        User channel = userRepository.findByUsername(targetUsername)
                .orElseThrow(() -> new UserNotFoundException("Không tìm thấy người dùng với username: " + targetUsername));

        return subscriptionRepository.existsBySubscriberAndChannel(subscriber, channel);
    }


}