package com.example.edustream.repository;

import com.example.edustream.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    @Query("""
        SELECT n FROM Notification n
        JOIN FETCH n.sender
        WHERE n.recipient.id = :recipientId
        ORDER BY n.createdAt DESC
        """)
    Page<Notification> findTop10ByRecipientId(@Param("recipientId") Long recipientId, Pageable pageable);

    @Modifying
    @Query("""
        UPDATE Notification n SET n.isRead = true
        WHERE n.recipient.id = :recipientId AND n.isRead = false
        """)
    void markAllAsReadByRecipientId(@Param("recipientId") Long recipientId);
    @Query("""
    SELECT COUNT(n) FROM Notification n
    WHERE n.recipient.id = :recipientId
    AND n.isRead = false
    """)
    int countUnreadNotifications(@Param("recipientId") Long recipientId);
}