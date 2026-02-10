package com.eduverse.dtos;

import lombok.Data;

@Data
public class TimetableEntryDto {
    private Integer id;
    private String subjectName;
    private String subjectCode;
    private String facultyName;
    private String classroomName;
    private String dayOfWeek;
    private int periodNumber;
    private String timeSlot;
    private String startTime;
    private String endTime;
}
