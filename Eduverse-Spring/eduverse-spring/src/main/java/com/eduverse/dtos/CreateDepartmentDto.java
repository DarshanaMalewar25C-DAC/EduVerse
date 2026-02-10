package com.eduverse.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateDepartmentDto {
    @NotBlank
    @Size(max = 100)
    private String name;

    @NotBlank
    @Size(max = 10)
    @Pattern(regexp = "^[A-Z0-9]+$", message = "Code must be alphanumeric and uppercase")
    private String code;
}
