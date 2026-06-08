package com.example.edustream.service;

import com.example.edustream.entity.User;
import com.example.edustream.entity.UserPrincipal;
import com.example.edustream.entity.enums.AuthProvider;
import com.example.edustream.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;


@Service
@RequiredArgsConstructor
public class UserDetailService implements UserDetailsService {

	private final UserRepository userRepository;

	@Override
	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
		// TODO Auto-generated method stub

		try {

			String[] parts = username.split(":", 2);
			AuthProvider provider;
			String email;

			if (parts.length == 2) {
				provider = AuthProvider.valueOf(parts[0]);
				email = parts[1];
			}
			else {
				provider = AuthProvider.DEFAULT;
				email = username;
			}

			System.out.println(email+" "+ provider);

			User user = userRepository.findByEmailAndAuthProvider(email, provider)
					.orElseThrow(() -> new UsernameNotFoundException(
							"User not found with email: " + email + " and provider: " + provider));

			return new UserPrincipal(user);

		} catch (Exception e) {
			throw new UsernameNotFoundException("Cannot find user with username: " + username, e);
		}

	}

}
