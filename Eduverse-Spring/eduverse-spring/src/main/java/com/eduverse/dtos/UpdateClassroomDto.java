package com.eduverse.dtos;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateClassroomDto {
    @NotBlank
    @Size(max = 50)
    private String roomNumber;

    @NotBlank
    @Size(max = 100)
    private String building;

    @Min(1)
    @Max(500)
    private int capacity;
}
