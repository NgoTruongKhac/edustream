package com.example.edustream.service;

import com.example.edustream.dto.request.ChangeEmailRequestDto;
import com.example.edustream.dto.request.OtpRequestDto;
import com.example.edustream.dto.request.UserUpdateRequestDto;
import com.example.edustream.dto.response.UserResponseDto;
import com.example.edustream.entity.User;
import com.example.edustream.entity.UserPrincipal;
import com.example.edustream.entity.enums.AuthProvider;
import com.example.edustream.exception.*;
import com.example.edustream.mapper.UserMapper;
import com.example.edustream.repository.UserRepository;
import com.example.edustream.util.SendEmail;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Random;


@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final CloudinaryService cloudinaryService;
    private final SendEmail  sendEmail;
    private final HttpSession session;
    private static final int OTP_EXP = 5;

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
        User user = userRepository.findByUsername(username).orElseThrow(() -> new UserNotFoundException("username not found"));

        return userMapper.toUserResponseDto(user);
    }

    public UserResponseDto updateUser(UserPrincipal userPrincipal, UserUpdateRequestDto userUpdateRequestDto) {
        if (userPrincipal == null) {
            throw new IllegalStateException("userPrincipal is null");
        }

        User user = userPrincipal.getUser();
        String newUsername = userUpdateRequestDto.getUsername();

        if (newUsername != null && !newUsername.trim().isEmpty() && !newUsername.equals(user.getUsername())) {

            // 1. Kiểm tra điều kiện 30 ngày
            LocalDateTime lastUpdated = user.getUsernameLastUpdatedAt();
            if (lastUpdated != null) {
                LocalDateTime nextAllowedUpdate = lastUpdated.plusDays(30);

                if (LocalDateTime.now().isBefore(nextAllowedUpdate)) {
                    long daysLeft = ChronoUnit.DAYS.between(LocalDateTime.now(), nextAllowedUpdate);
                    throw new UsernameChangeCooldownException("Bạn chỉ có thể đổi username sau " + (daysLeft > 0 ? daysLeft : 1) + " ngày nữa.");
                }
            }

            // 2. Kiểm tra xem username mới đã có ai dùng chưa
            if (userRepository.existsByUsername(newUsername)) {
                throw new UsernameAlreadyExistsException("Username '" + newUsername + "' đã được sử dụng. Vui lòng chọn tên khác.");
            }

            // 3. Cập nhật lại thời gian đổi username
            user.setUsernameLastUpdatedAt(LocalDateTime.now());
        }

        userMapper.updateUser(user, userUpdateRequestDto);

        User userUpdated = userRepository.save(user);
        return userMapper.toUserResponseDto(userUpdated);
    }
    public UserResponseDto updateCoverImage(UserPrincipal userPrincipal, MultipartFile imageFile) {
        User user = validateAndGetUser(userPrincipal, imageFile);

        String publicId = "edustream/users/" + user.getId() + "_cover";
        try{
            String imageUrl = cloudinaryService.uploadImage(imageFile, publicId);
            user.setCoverImage(imageUrl);
            userRepository.save(user);
            return userMapper.toUserResponseDto(user);
        } catch (IOException e) {
            throw new RuntimeException("Upload avatar thất bại: " + e.getMessage(), e);
        }

    }

    public UserResponseDto updateAvatar(UserPrincipal userPrincipal, MultipartFile avatarFile){
        User user = validateAndGetUser(userPrincipal, avatarFile);

        String publicId = "edustream/users/" + user.getId() + "_avatar";

        try{
            String imageUrl = cloudinaryService.uploadImage(avatarFile, publicId);

            user.setAvatar(imageUrl);
            userRepository.save(user);
            return userMapper.toUserResponseDto(user);
        } catch (IOException e) {
            throw new RuntimeException("Upload avatar thất bại: " + e.getMessage(), e);
        }

    }
    public void changeEmail(ChangeEmailRequestDto changeEmailRequestDto) {
        // check exist email
        if (userRepository.findByEmailAndAuthProvider(changeEmailRequestDto.getNewEmail(), AuthProvider.DEFAULT).isPresent()) {
            throw new EmailAlreadyExistsException("Email already exists");
        }

        // generate random OTP (6 numbers)
        Random random = new Random();
        int otpValue = 100000 + random.nextInt(900000);
        String otp = String.valueOf(otpValue);

        // send email with otp to registerRequestDto.getEmail()
        sendEmail.sendOtpToEmail(changeEmailRequestDto.getNewEmail(), otp);

        // save session include requestDto and OTP and exp OTP
        session.setAttribute("newEmail", changeEmailRequestDto.getNewEmail());
        session.setAttribute("otp", otp);
        session.setAttribute("otp_exp", System.currentTimeMillis() + OTP_EXP * 60 * 1000);
    }

    public UserResponseDto verifyChangeEmail(UserPrincipal userPrincipal, OtpRequestDto otpRequestDto) {
        if (userPrincipal == null) {
            throw new IllegalStateException("userPrincipal is null");
        }

        String sessionOtp = (String) session.getAttribute("otp");
        Long otpExp = (Long) session.getAttribute("otp_exp");
        String newEmail = (String) session.getAttribute("newEmail");

        // 1. Kiểm tra OTP
        if (sessionOtp == null || !sessionOtp.equals(otpRequestDto.getOtp())) {
            throw new NotMatchingOtpException("Invalid OTP code");
        }

        // 2. Kiểm tra hết hạn
        if (System.currentTimeMillis() > otpExp) {
            clearOtpSession();
            throw new ExpiredOtpException("OTP has expired. Please request a new one.");
        }

        // 3. Thực hiện patch user với email mới
        User user = userPrincipal.getUser();
        user.setEmail(newEmail);
        User updatedUser = userRepository.save(user);

        // 4. Xóa session sau khi đã verify thành công
        clearOtpSession();

        return userMapper.toUserResponseDto(updatedUser);
    }

    private void clearOtpSession() {
        session.removeAttribute("otp");
        session.removeAttribute("otp_exp");
        session.removeAttribute("newEmail");
    }

    private User validateAndGetUser(UserPrincipal userPrincipal, MultipartFile file) {
        if (userPrincipal == null) {
            throw new IllegalStateException("userPrincipal is null");
        }
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File ảnh không được để trống");
        }
        return userPrincipal.getUser();
    }

}
