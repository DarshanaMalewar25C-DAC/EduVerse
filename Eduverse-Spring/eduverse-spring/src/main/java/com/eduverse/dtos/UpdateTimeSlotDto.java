package com.eduverse.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import lombok.Data;
import java.time.LocalTime;

@Data
public class UpdateTimeSlotDto {
    @NotBlank
    @Size(max = 20)
    private String shift = "Morning";

    @NotNull
    private LocalTime startTime;

    @NotNull
    private LocalTime endTime;

    @Min(30)
    @Max(180)
    private int periodDurationMinutes;

    @Min(0)
    @Max(60)
    private int breakDurationMinutes;

    @Min(1)
    @Max(10)
    private int breakAfterPeriod;

    @Min(1)
    @Max(5)
    private int year;
}
