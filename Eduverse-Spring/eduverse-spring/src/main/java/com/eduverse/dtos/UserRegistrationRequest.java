package com.eduverse.dtos;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.util.List;

@Data
public class UserRegistrationRequest {
    @NotBlank
    @Size(min = 2, max = 100)
    @Pattern(regexp = "^[A-Za-z\\s.]+$", message = "Full Name contains invalid characters")
    private String fullName;

    @NotBlank
    @Email
    @Size(max = 100)
    @Pattern(regexp = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$", message = "Invalid Email Format")
    private String email;

    @NotBlank
    @Size(min = 8, max = 100)
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$", message = "Password must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character")
    private String password;

    @NotNull
    @Min(1)
    @Max(4)
    private Integer roleId;

    private Integer departmentId;

    private List<Integer> subjectIds;

    @NotBlank
    @Size(min = 2, max = 50)
    @Pattern(regexp = "^[A-Za-z\\s.,-]+$", message = "Designation contains invalid characters")
    private String designation;
}
