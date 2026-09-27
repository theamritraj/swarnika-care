package com.swarnikacare.iam.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;


@Getter
@Setter
@NoArgsConstructor
public class AuthResponse {
    private String token;
    private String type = "Bearer";

    public AuthResponse(String token) {
        this.token = token;
    }

}
