package com.eduverse.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateDepartmentDto {
    @NotBlank
    @Size(max = 100)
    private String name;

    @NotBlank
    @Size(max = 10)
    private String code;
}
