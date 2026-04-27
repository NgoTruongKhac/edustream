package com.example.edustream.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;


@Entity
@Table(
        name = "subscriptions",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"subscriber_id", "channel_id"})
        }
)
@Getter
@Setter
public class Subscription extends AbstractEntity<Subscription> {

    // Người thực hiện hành động đăng ký (Follower)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subscriber_id", nullable = false)
    private User subscriber;

    // Kênh / Người được đăng ký (Followee)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "channel_id", nullable = false)
    private User channel;

}