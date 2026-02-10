package com.eduverse.dtos;

import lombok.Data;
import java.util.ArrayList;
import java.util.List;

@Data
public class TimetableGenerationResponse {
    private boolean success;
    private String message;
    private List<TimetableDto> generatedTimetables = new ArrayList<>();
}
