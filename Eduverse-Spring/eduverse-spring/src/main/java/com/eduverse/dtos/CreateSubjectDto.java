package com.eduverse.dtos;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateSubjectDto {
    @NotBlank
    @Size(max = 100)
    private String name;

    @NotBlank
    @Size(max = 20)
    @Pattern(regexp = "^[A-Z0-9\\-]+$", message = "Code must be alphanumeric (hyphens allowed)")
    private String code;

    private Integer departmentId;

    @Min(1)
    @Max(10)
    private int credits;

    @Min(1)
    @Max(10)
    private int classesPerWeek = 5;

    @Min(1)
    @Max(5)
    private int year = 1;

    @Min(30)
    @Max(180)
    private int durationMinutes = 60;

    private Integer teacherId;
}
