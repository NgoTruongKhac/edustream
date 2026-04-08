package com.example.edustream.security.jwt;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import com.example.edustream.entity.User;
import com.example.edustream.entity.UserPrincipal;
import com.example.edustream.repository.UserRepository;
import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;


import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import tools.jackson.databind.ObjectMapper;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

	private final JwtAuthenticationService jwtService;
	private final UserRepository userRepository;

	@Override
	protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response,
			@NonNull FilterChain filterChain) throws ServletException, IOException {
		final String authHeader = request.getHeader("Authorization");
		final String jwt;
		final String userEmail;
		if (authHeader == null || !authHeader.startsWith("Bearer ")) {
			filterChain.doFilter(request, response);
			return;
		}
		jwt = authHeader.substring(7);

		try {

			userEmail = jwtService.extractUsername(jwt);
			if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
				User user = userRepository.findByEmail(userEmail)
						.orElseThrow(() -> new UsernameNotFoundException("User not found"));
				UserDetails userDetails = new UserPrincipal(user);
				if (jwtService.isTokenValid(jwt, userDetails)) {
					UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(userDetails,
							null, userDetails.getAuthorities());
					authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
					SecurityContextHolder.getContext().setAuthentication(authToken);
				}
			}
			filterChain.doFilter(request, response);
		} catch (SignatureException e) {
			// TODO: handle exception
			sendErrorResponse(response, e.getMessage());

		} catch (MalformedJwtException e) {
			// TODO: handle exception
			sendErrorResponse(response, e.getMessage());
		} catch (ExpiredJwtException e) {
			// TODO: handle exception
			sendErrorResponse(response, e.getMessage());
		}

	}

	private void sendErrorResponse(HttpServletResponse res, String message) throws IOException {
		ObjectMapper objectMapper = new ObjectMapper();
		Map<String, Object> body = new HashMap<>();
		int status = HttpServletResponse.SC_UNAUTHORIZED;
		res.setStatus(status);
		res.setContentType(MediaType.APPLICATION_JSON_VALUE);

		body.put("status", status);
		body.put("error", "unauthorized");
		body.put("message", message);

		objectMapper.writeValue(res.getOutputStream(), body);

	}
}