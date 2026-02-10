package com.eduverse.dtos;

import lombok.Data;
import java.util.ArrayList;
import java.util.List;

@Data
public class TimetableGenerationRequest {
    private Integer semesterId;
    private Integer departmentId;
    private int year = 1;
    private List<Integer> subjectIds = new ArrayList<>();
    private int maxClassesPerDay = 6;
    private boolean includeWeekends = false;
    private int numberOfSolutions = 3;
}
