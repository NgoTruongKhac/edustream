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

    // user vi phạm
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // video vi phạm
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "video_id")
    private Video video;

    // loại vi phạm
    @Enumerated(EnumType.STRING)
    @Column(name = "violation_type", nullable = false)
    private ViolationType violationType;


    // trạng thái xử lý
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private ViolationStatus status = ViolationStatus.PENDING;

    // lý do chi tiết
    @Column(name = "reason", columnDefinition = "TEXT")
    private String reason;

    // số strike cộng thêm
    @Column(name = "strike_count")
    private int strikeCount = 1;

}