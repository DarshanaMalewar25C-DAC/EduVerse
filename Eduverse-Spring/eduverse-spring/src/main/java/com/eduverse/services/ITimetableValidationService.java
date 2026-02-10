package com.eduverse.services;

import com.eduverse.dtos.ValidationResult;
import com.eduverse.models.*;
import java.util.List;

public interface ITimetableValidationService {
    ValidationResult validateTimetableGeneration(
            List<Subject> subjects,
            List<User> teachers,
            List<Classroom> classrooms,
            TimeSlot shift,
            int expectedStudents);

    int calculateTotalPeriods(TimeSlot shift);
}
