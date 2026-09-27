package com.swarnikacare.organization.client.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;


@Getter
@Setter
@NoArgsConstructor
public class StaffProvisionRequest {
    private String email;
    private String role;

    public StaffProvisionRequest(String email, String role) {
        this.email = email;
        this.role = role;
    }

}
