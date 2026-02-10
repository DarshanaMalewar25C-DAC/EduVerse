package com.eduverse.dtos;

import lombok.Data;

@Data
public class SubjectDto {
    private Integer id;
    private String name;
    private String code;
    private Integer departmentId;
    private String departmentName;
    private int credits;
    private int classesPerWeek;
    private int year;
    private int durationMinutes;
    private Integer teacherId;
    private String teacherName;
}
