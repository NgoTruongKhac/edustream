package com.example.edustream.security.oauth2;

import java.util.Optional;

import com.example.edustream.entity.User;
import com.example.edustream.entity.UserPrincipal;
import com.example.edustream.entity.enums.AuthProvider;
import com.example.edustream.entity.enums.Role;
import com.example.edustream.entity.oauth2.OAuth2UserInfo;
import com.example.edustream.entity.oauth2.OAuth2UserInfoFactory;
import com.example.edustream.exception.OAuth2AuthenticationProcessingException;
import com.example.edustream.repository.UserRepository;
import com.example.edustream.util.StringUtil;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;


import lombok.RequiredArgsConstructor;


@Service
@RequiredArgsConstructor
public class OAuth2UserService extends DefaultOAuth2UserService{

	private final UserRepository userRepository;
	
	
	@Override
	public OAuth2User loadUser(OAuth2UserRequest oAuth2UserRequest) throws OAuth2AuthenticationException {
		// TODO Auto-generated method stub
		OAuth2User oAuth2User=super.loadUser(oAuth2UserRequest);
		
		
		User user=processOAuth2User(oAuth2UserRequest,oAuth2User);
		
		return new UserPrincipal(user, oAuth2User.getAttributes());
		
	}


	private User processOAuth2User(OAuth2UserRequest oAuth2UserRequest, OAuth2User oAuth2User) {
		// TODO Auto-generated method stub
		//1 get email from OAuth2UserInfo
		
		String registrationId=oAuth2UserRequest.getClientRegistration().getRegistrationId();
		OAuth2UserInfo oAuth2UserInfo= OAuth2UserInfoFactory.getOAuth2UserInfo(registrationId, oAuth2User.getAttributes());
		
		//2 findByProviderId 
		
		Optional<User> userOptional=userRepository.findByProviderId(oAuth2UserInfo.getProviderId());
		User user;
		
		//3 if user already exists -> updateExistingUser
		
		if(userOptional.isPresent()) {
			user=userOptional.get();
			
			AuthProvider authProvider=AuthProvider.valueOf(registrationId.toUpperCase());
			if(!user.getAuthProvider().equals(authProvider)) {
				throw new OAuth2AuthenticationProcessingException("Looks like you're signed up with " +
                        user.getAuthProvider() + " account. Please use your " + user.getAuthProvider() +
                        " account to login.");
			}
			user=updateExistingUser(user, oAuth2UserInfo);
			
		}else {
			
			user=registerNewUser(oAuth2UserRequest, oAuth2UserInfo);
		}
		
		return user;
		
		//4 if user does not exist -> registerNewUser
		
		
	}
	
	private User registerNewUser(OAuth2UserRequest oAuth2UserRequest, OAuth2UserInfo oauth2UserInfo){
		User user=new User();
		
		String registrationId=oAuth2UserRequest.getClientRegistration().getRegistrationId();
		
		AuthProvider authProvider=AuthProvider.valueOf(registrationId.toUpperCase());
		
		
		user.setAuthProvider(authProvider);
		user.setProviderId(oauth2UserInfo.getProviderId());
		user.setFullName(oauth2UserInfo.getUsername());
		user.setUsername(generateUniqueHandle(oauth2UserInfo.getUsername()));
		user.setEmail(oauth2UserInfo.getEmail());
		user.setAvatar(oauth2UserInfo.getAvatar());
		user.setRole(Role.CUSTOMER);
		
		return userRepository.save(user);
		
		
	}
	private String generateUniqueHandle(String username) {
		String baseHandle = StringUtil.toBaseHandle(username);
		String finalHandle = baseHandle;
		int counter = 1;

		while (userRepository.existsByUsername(finalHandle)) {
			finalHandle = baseHandle + counter;
			counter++;
		}

		return finalHandle;
	}

	
	private User updateExistingUser(User existingUser, OAuth2UserInfo oAuth2UserInfo) {
		
		existingUser.setUsername(oAuth2UserInfo.getUsername());
		existingUser.setAvatar(oAuth2UserInfo.getAvatar());
		
		return userRepository.save(existingUser);
	}
		

}
