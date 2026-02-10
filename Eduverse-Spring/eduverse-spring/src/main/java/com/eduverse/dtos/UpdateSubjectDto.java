package com.eduverse.dtos;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateSubjectDto {
    @NotBlank
    @Size(max = 100)
    private String name;

    @NotBlank
    @Size(max = 20)
    private String code;

    private Integer departmentId;

    @Min(1)
    @Max(10)
    private int credits;

    @Min(1)
    @Max(10)
    private int classesPerWeek;

    @Min(1)
    @Max(5)
    private int year;

    @Min(30)
    @Max(180)
    private int durationMinutes;

    private Integer teacherId;
}
