package com.example.edustream.repository;

import com.example.edustream.entity.Subscription;
import com.example.edustream.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    // Hàm kiểm tra xem user này đã đăng ký kênh kia chưa
    boolean existsBySubscriberAndChannel(User subscriber, User channel);

    // (Tùy chọn) Hàm dùng để hủy đăng ký nếu bạn muốn làm chức năng Toggle
    void deleteBySubscriberAndChannel(User subscriber, User channel);

    @Query("SELECT s.channel FROM Subscription s WHERE s.subscriber = :subscriber ORDER BY s.createdAt DESC")
    Page<User> findSubscribedChannels(@Param("subscriber") User subscriber, Pageable pageable);
}