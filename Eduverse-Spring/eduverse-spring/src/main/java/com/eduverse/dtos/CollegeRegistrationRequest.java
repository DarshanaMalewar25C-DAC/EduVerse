package com.eduverse.dtos;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class CollegeRegistrationRequest {
    @NotBlank
    @Size(min = 3, max = 200)
    @Pattern(regexp = "^[A-Za-z0-9\\s.,&-]+$", message = "College Name contains invalid characters")
    private String collegeName;

    @NotBlank
    @Size(min = 2, max = 20)
    @Pattern(regexp = "^[A-Z0-9]+$", message = "College Code must be alphanumeric uppercase")
    private String collegeCode;

    @NotBlank
    @Size(min = 10, max = 500)
    private String address;

    @NotBlank
    @Size(min = 2, max = 100)
    private String state;

    @NotBlank
    @Email
    @Size(max = 100)
    private String contactEmail;

    @NotBlank
    @Size(max = 20)
    @Pattern(regexp = "^\\d{10}$", message = "Phone number must be 10 digits")
    private String contactPhone;

    @NotNull
    @Min(1800)
    @Max(2100)
    private Integer establishedYear;

    @NotBlank
    @Size(min = 2, max = 100)
    @Pattern(regexp = "^[A-Za-z\\s.]+$", message = "Admin Name contains invalid characters")
    private String adminName;

    @NotBlank
    @Email
    @Size(max = 100)
    private String adminEmail;

    @NotBlank
    @Size(min = 8, max = 100)
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$", message = "Password must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character")
    private String adminPassword;
}
