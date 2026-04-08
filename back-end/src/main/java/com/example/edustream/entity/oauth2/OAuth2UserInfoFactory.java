package com.example.edustream.entity.oauth2;

import com.example.edustream.entity.enums.AuthProvider;

import java.util.Map;


public class OAuth2UserInfoFactory {

    public static OAuth2UserInfo getOAuth2UserInfo(String registrationId, Map<String, Object> attributes) {

        if (registrationId.equals(AuthProvider.GOOGLE.toString().toLowerCase())) {

            return new GoogleOAuth2UserInfo(attributes);
        }


        return null;

    }

}