package com.eduverse.services;

import com.eduverse.dtos.*;
import java.util.List;

public interface ITimetableGenerationService {
    TimetableGenerationResponse generateTimetables(TimetableGenerationRequest request, Integer userId);

    TimetableDto getTimetableDto(Integer timetableId);

    boolean approveTimetable(TimetableApprovalRequest request, Integer userId);

    List<TimetableDto> getAllTimetables(Integer collegeId, Integer userId, String role);

    List<TimetableDto> getTimetablesBySemester(Integer semesterId, Integer collegeId, Integer userId, String role);

    boolean deleteTimetable(Integer id, Integer collegeId);
}
