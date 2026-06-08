package com.example.edustream.entity;

import com.example.edustream.entity.enums.ViolationStatus;
import com.example.edustream.entity.enums.ViolationType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;


@Entity
@Table(name = "violations")
@Getter
@Setter
public class Violation extends AbstractEntity<Violation> {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "video_id")
    private Video video;

    @Enumerated(EnumType.STRING)
    @Column(name = "violation_type", nullable = false)
    private ViolationType violationType;


    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private ViolationStatus status = ViolationStatus.PENDING;

    @Column(name = "reason", columnDefinition = "TEXT")
    private String reason;

    @Column(name = "strike_count")
    private int strikeCount = 1;

}