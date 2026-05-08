package com.example.edustream.service;

import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OnlineUserService {
    // Dùng ConcurrentHashSet để thread-safe
    private final Set<Long> onlineUserIds = ConcurrentHashMap.newKeySet();

    public void userConnected(Long userId) {
        onlineUserIds.add(userId);
    }

    public void userDisconnected(Long userId) {
        onlineUserIds.remove(userId);
    }

    public boolean isOnline(Long userId) {
        return onlineUserIds.contains(userId);
    }
}