package com.eduverse.dtos;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
public class TimetableDto {
    private Integer id;
    private String name;
    private String semesterName;
    private int year;
    private Integer semesterId;
    private Integer departmentId;
    private int breakAfterPeriod;
    private LocalDateTime generatedDate;
    private String generatedBy;
    private String status;
    private Double optimizationScore;
    private List<TimetableEntryDto> entries = new ArrayList<>();
}
