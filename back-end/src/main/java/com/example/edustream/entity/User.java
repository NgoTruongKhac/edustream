package com.example.edustream.entity;


import com.example.edustream.entity.enums.AuthProvider;
import com.example.edustream.entity.enums.Role;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity()
@Table(name = "users")
@Getter
@Setter
public class User extends AbstractEntity<User> {

    @Column(name = "username", unique = true, nullable = false)
    private String username;

    @Column(name = "full_name")
    private String fullName;

    @Column(name = "email")
    private String email;

    @Column(name = "password")
    private String password;

    @Column(name = "description")
    private String description;

    @Column(name = "avatar_url")
    private String avatar;

    @Column(name = "cover_image_url")
    private String coverImage;

    @Column(name = "role")
    @Enumerated(EnumType.STRING)
    private Role role;

    @Column(name = "auth_provider")
    @Enumerated(EnumType.STRING)
    private AuthProvider authProvider;

    @Column(name = "provider_id")
    private String providerId;

    @Column(name = "username_last_updated_at")
    private LocalDateTime usernameLastUpdatedAt;

}
