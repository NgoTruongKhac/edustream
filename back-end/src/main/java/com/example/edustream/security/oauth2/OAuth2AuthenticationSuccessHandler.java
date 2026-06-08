package com.example.edustream.security.oauth2;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.TimeUnit;

import com.example.edustream.entity.UserPrincipal;
import com.example.edustream.security.jwt.JwtAuthenticationService;
import com.example.edustream.security.jwt.JwtProperties;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;


import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
	
	private final JwtAuthenticationService jwtService;
	
	@Value("${app.frontend-domain}")
	private String frontEndDomain;
	private final JwtProperties jwtProperties;
    

	@Override
	public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
			Authentication authentication) throws IOException, ServletException {
		
		String targetUrl = determineTargetUrl(request, response, authentication);
		
		if (response.isCommitted()) {
            logger.debug("Response has already been committed. Unable to redirect to " + targetUrl);
            return;
        }

		clearAuthenticationAttributes(request);
		getRedirectStrategy().sendRedirect(request, response, targetUrl);
	}

	protected String determineTargetUrl(HttpServletRequest request,
										HttpServletResponse response,
										Authentication authentication) {

		String redirectUri = frontEndDomain;

		UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

		String accessToken = jwtService.generateToken(userPrincipal);
		String refreshToken = jwtService.generateRefreshToken(userPrincipal);

		addCookie(response, "refreshToken", refreshToken, jwtProperties.getRefreshTokenExpiration());

		String encodedAccessToken = URLEncoder.encode(accessToken, StandardCharsets.UTF_8);

		return redirectUri + "?accessToken=" + encodedAccessToken;
	}

    private void addCookie(HttpServletResponse response, String name, String value, long maxAgeInMilliseconds) {
        Cookie cookie = new Cookie(name, value);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge((int) TimeUnit.MILLISECONDS.toSeconds(maxAgeInMilliseconds));
        // cookie.setSecure(true); //môi trường Production (khi dùng HTTPS)
        response.addCookie(cookie);
    }
}