package com.example.edustream.repository;

import com.example.edustream.entity.Violation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ViolationRepository extends JpaRepository<Violation, Long> {
}
