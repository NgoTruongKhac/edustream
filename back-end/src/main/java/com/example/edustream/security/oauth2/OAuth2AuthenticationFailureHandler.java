package com.example.edustream.security.oauth2;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;


@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationFailureHandler extends SimpleUrlAuthenticationFailureHandler {

    private final HttpCookieOAuth2AuthorizationRequestRepository httpCookieOAuth2AuthorizationRequestRepository;
    
    @Value("${app.frontend-domain}")
	private String frontEndDomain;

    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response,
            AuthenticationException exception) throws IOException, ServletException {
        
        // 1. Xác định URL mục tiêu để chuyển hướng về
        // Thường là trang đăng nhập của frontend
        String targetUrl = frontEndDomain + "/login";

        // 2. Lấy thông điệp lỗi và xây dựng URL chuyển hướng cuối cùng
        // Gửi thông điệp lỗi qua query parameter để frontend có thể xử lý
        targetUrl = UriComponentsBuilder.fromUriString(targetUrl)
                .queryParam("error", exception.getLocalizedMessage())
                .build().toUriString();

        // 3. Dọn dẹp các cookie liên quan đến yêu cầu OAuth2
        // Điều này rất quan trọng để đảm bảo không còn cookie cũ nào tồn tại
        // cho các lần thử đăng nhập tiếp theo.
        httpCookieOAuth2AuthorizationRequestRepository.removeAuthorizationRequestCookies(request, response);

        // 4. Thực hiện chuyển hướng
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}