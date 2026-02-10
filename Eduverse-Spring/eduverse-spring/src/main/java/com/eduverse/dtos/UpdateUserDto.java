package com.eduverse.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateUserDto {
    @NotBlank
    @Size(min = 2, max = 100)
    private String fullName;

    @NotBlank
    @Email
    @Size(max = 100)
    private String email;

    private String password;

    private Integer departmentId;
    private String designation;
    @com.fasterxml.jackson.annotation.JsonProperty("isActive")
    private boolean isActive;
}
