package com.eduverse.dtos;

import lombok.Data;
import java.time.LocalTime;

@Data
public class TimeSlotDto {
    private Integer id;
    private String shift;
    private LocalTime startTime;
    private LocalTime endTime;
    private int periodDurationMinutes;
    private int breakDurationMinutes;
    private int breakAfterPeriod;
    private int year;
}
