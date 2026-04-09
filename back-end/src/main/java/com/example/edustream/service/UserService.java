package com.example.edustream.service;

import com.example.edustream.dto.request.UserUpdateRequestDto;
import com.example.edustream.dto.response.UserResponseDto;
import com.example.edustream.entity.User;
import com.example.edustream.entity.UserPrincipal;
import com.example.edustream.mapper.UserMapper;
import com.example.edustream.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    public UserResponseDto getMe(UserPrincipal userPrincipal) {

        if (userPrincipal == null) {
            throw new IllegalStateException("userPrincipal is null");
        }
        User currentUser = userPrincipal.getUser();
        return userMapper.toUserResponseDto(currentUser);
    }

    public Page<UserResponseDto> getAllUsers(int page) {

        Pageable pageable = PageRequest.of(page, 10);

        Page<User> userPage = userRepository.findAll(pageable);
        System.out.println("Total users: " + userPage.getTotalElements());

        return userPage.map(userMapper::toUserResponseDto);

    }

    public UserResponseDto getUserByUsername(String username) {
        User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("username not found"));

        return userMapper.toUserResponseDto(user);
    }

    public UserResponseDto updateUser(UserPrincipal userPrincipal, UserUpdateRequestDto userUpdateRequestDto) {
        if (userPrincipal == null) {
            throw new IllegalStateException("userPrincipal is null");

        }
        User user = userPrincipal.getUser();
        System.out.println("fullName: " + userUpdateRequestDto.getFullName());
        userMapper.updateUser(user, userUpdateRequestDto);
        User userUpdated = userRepository.save(user);
        return userMapper.toUserResponseDto(userUpdated);
    }

}
