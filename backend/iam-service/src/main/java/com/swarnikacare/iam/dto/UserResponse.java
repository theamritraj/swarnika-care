package com.swarnikacare.iam.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;


@Getter
@Setter
@NoArgsConstructor
public class UserResponse {
    private Long id;
    private String email;
    private String role;
    private String status;

    public UserResponse(Long id, String email, String role, String status) {
        this.id = id;
        this.email = email;
        this.role = role;
        this.status = status;
    }

}
