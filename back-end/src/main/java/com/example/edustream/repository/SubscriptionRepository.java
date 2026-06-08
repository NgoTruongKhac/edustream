package com.example.edustream.repository;

import com.example.edustream.entity.Subscription;
import com.example.edustream.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {

    List<Subscription> findByChannelId(Long channelId);
    boolean existsBySubscriberAndChannel(User subscriber, User channel);

    void deleteBySubscriberAndChannel(User subscriber, User channel);

    @Query("SELECT s.channel FROM Subscription s WHERE s.subscriber = :subscriber ORDER BY s.createdAt DESC")
    Page<User> findSubscribedChannels(@Param("subscriber") User subscriber, Pageable pageable);

    @Query("SELECT s.subscriber FROM Subscription s WHERE s.channel = :channel ORDER BY s.createdAt DESC")
    Page<User> findSubscribersByChannel(@Param("channel") User channel, Pageable pageable);
}