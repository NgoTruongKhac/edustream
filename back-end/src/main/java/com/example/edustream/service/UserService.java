package com.example.edustream.service;

import com.example.edustream.dto.request.UserRequestDto;
import com.example.edustream.dto.response.UserResponseDto;
import com.example.edustream.entity.UserPrincipal;
import com.example.edustream.mapper.UserMapper;
import com.example.edustream.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    public UserResponseDto getMe(UserPrincipal  userPrincipal){

    }
    public List<UserResponseDto> getAllUsers(){

    }

    public UserResponseDto getUserByUsername(String username){
    }

    public UserResponseDto updateUser(UserRequestDto userRequestDto){

    }
    public UserResponseDto updateEmail(String email){

    }

}
