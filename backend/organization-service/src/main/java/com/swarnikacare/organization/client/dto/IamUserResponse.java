package com.swarnikacare.organization.client.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;


@Getter
@Setter
@NoArgsConstructor
public class IamUserResponse {
    private Long id;
    private String email;
    private String role;
    private String status;

    public IamUserResponse(Long id, String email, String role, String status) {
        this.id = id;
        this.email = email;
        this.role = role;
        this.status = status;
    }

}
