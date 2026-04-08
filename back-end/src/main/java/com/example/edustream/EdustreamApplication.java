package com.example.edustream;

import com.example.edustream.security.jwt.JwtProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
@EnableConfigurationProperties(value = JwtProperties.class)
public class EdustreamApplication {

    public static void main(String[] args) {
        SpringApplication.run(EdustreamApplication.class, args);
    }

}
