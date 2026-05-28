package com.example.edustream.repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import com.example.edustream.entity.User;
import com.example.edustream.entity.enums.AuthProvider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface UserRepository extends JpaRepository<User, Long> {
	long count();
	List<User> findAllByCreatedAtAfter(Instant after);
	Optional<User> findByEmail(String email);
	Optional<User> findByProviderId(String providerId);
	Optional<User> findByEmailAndAuthProvider(String email, AuthProvider authProvider);
	Optional<User> findByUsername(String username);
	boolean existsByUsername(String handleName);

}
