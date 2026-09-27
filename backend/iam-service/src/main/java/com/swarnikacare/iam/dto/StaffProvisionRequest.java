package com.swarnikacare.iam.dto;

import com.swarnikacare.iam.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;


@Getter
@Setter
@NoArgsConstructor
public class StaffProvisionRequest {
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotNull(message = "Role is required")
    private Role role;

    public StaffProvisionRequest(String email, Role role) {
        this.email = email;
        this.role = role;
    }

}
