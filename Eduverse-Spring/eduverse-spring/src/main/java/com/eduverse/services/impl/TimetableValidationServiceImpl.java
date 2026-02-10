package com.eduverse.services.impl;

import com.eduverse.dtos.ValidationResult;
import com.eduverse.models.*;
import com.eduverse.services.ITimetableValidationService;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class TimetableValidationServiceImpl implements ITimetableValidationService {

    @Override
    public ValidationResult validateTimetableGeneration(
            List<Subject> subjects,
            List<User> teachers,
            List<Classroom> classrooms,
            TimeSlot shift,
            int expectedStudents) {

        ValidationResult result = new ValidationResult();

        if (subjects.size() < 4) {
            result.setValid(false);
            result.getErrors().add("Minimum 4 subjects are required for timetable generation.");
        }

        if (subjects.size() > 8) {
            result.setValid(false);
            result.getErrors().add("Maximum 8 subjects allowed for timetable generation.");
        }

        long totalShiftMinutes = Duration.between(shift.getStartTime(), shift.getEndTime()).toMinutes();
        if (totalShiftMinutes < 180) {
            result.setValid(false);
            result.getErrors().add("Shift duration must be at least 3 hours (180 minutes).");
        }

        if (totalShiftMinutes > 480) {
            result.setValid(false);
            result.getErrors().add("Shift duration cannot exceed 8 hours (480 minutes).");
        }

        int totalPeriodsWithBreaks = calculateTotalPeriods(shift);

        if (shift.getTotalPeriods() != totalPeriodsWithBreaks) {
            result.getWarnings().add("TimeSlot TotalPeriods (" + shift.getTotalPeriods() + ") should be "
                    + totalPeriodsWithBreaks + " based on shift duration and break configuration.");
        }

        int totalClassesNeeded = subjects.stream().mapToInt(Subject::getClassesPerWeek).sum();
        int totalSlotsAvailable = shift.getTotalPeriods() * 6;

        if (totalClassesNeeded > totalSlotsAvailable) {
            result.setValid(false);
            result.getErrors().add("Not enough time slots available. Need " + totalClassesNeeded + " slots but only "
                    + totalSlotsAvailable + " available (6 days × " + shift.getTotalPeriods() + " periods).");
        }

        Map<Integer, Long> teacherSubjectCount = subjects.stream()
                .filter(s -> s.getTeacherId() != null)
                .collect(Collectors.groupingBy(Subject::getTeacherId, Collectors.counting()));

        for (Map.Entry<Integer, Long> entry : teacherSubjectCount.entrySet()) {
            if (entry.getValue() > 2) {
                result.setValid(false);
                User teacher = teachers.stream().filter(t -> t.getId().equals(entry.getKey())).findFirst().orElse(null);
                result.getErrors()
                        .add("Teacher '" + (teacher != null ? teacher.getFullName() : "Unknown") + "' is assigned to "
                                + entry.getValue() + " subjects. Maximum allowed is 2 subjects per teacher.");
            }
        }

        List<Subject> subjectsWithoutTeachers = subjects.stream().filter(s -> s.getTeacherId() == null)
                .collect(Collectors.toList());
        if (!subjectsWithoutTeachers.isEmpty()) {
            result.getWarnings().add(subjectsWithoutTeachers.size()
                    + " subject(s) don't have assigned teachers. Random department teachers will be assigned.");
        }

        long uniqueTeachersNeeded = subjects.stream().filter(s -> s.getTeacherId() != null).map(Subject::getTeacherId)
                .distinct().count();
        if (uniqueTeachersNeeded < 2) {
            result.setValid(false);
            result.getErrors().add("At least 2 unique teachers must be assigned to subjects.");
        }

        List<Classroom> suitableClassrooms = classrooms.stream().filter(c -> c.getCapacity() >= expectedStudents)
                .collect(Collectors.toList());
        if (suitableClassrooms.isEmpty()) {
            result.getWarnings().add("No classrooms with capacity >= " + expectedStudents
                    + ". Largest available classroom will be used.");
        }

        if (classrooms.size() < 2) {
            result.setValid(false);
            result.getErrors().add("At least 2 classrooms are required for timetable generation.");
        }

        if (classrooms.size() < subjects.size()) {
            result.getWarnings().add("Only " + classrooms.size() + " classrooms available for " + subjects.size()
                    + " subjects. This may cause scheduling conflicts.");
        }

        List<Integer> departmentIds = subjects.stream().map(Subject::getDepartmentId).distinct()
                .collect(Collectors.toList());
        if (departmentIds.size() > 1) {
            result.getWarnings().add(
                    "Subjects from multiple departments detected. Ensure teachers are from the correct departments.");
        }

        for (Subject subject : subjects) {
            if (subject.getClassesPerWeek() < 1 || subject.getClassesPerWeek() > 10) {
                result.setValid(false);
                result.getErrors().add("Subject '" + subject.getName() + "' has invalid ClassesPerWeek ("
                        + subject.getClassesPerWeek() + "). Must be between 1 and 10.");
            }
        }

        List<User> teachersInDept = teachers.stream()
                .filter(t -> t.getDepartmentId() != null && departmentIds.contains(t.getDepartmentId()))
                .collect(Collectors.toList());
        if (teachersInDept.size() < 2) {
            result.setValid(false);
            result.getErrors().add(
                    "Not enough teachers in the department. Found " + teachersInDept.size() + ", need at least 2.");
        }

        return result;
    }

    @Override
    public int calculateTotalPeriods(TimeSlot shift) {
        long totalShiftMinutes = Duration.between(shift.getStartTime(), shift.getEndTime()).toMinutes();
        int periodDuration = shift.getPeriodDurationMinutes();
        int breakDuration = shift.getBreakDurationMinutes();
        int breakAfter = shift.getBreakAfterPeriod();

        int currentUsed = 0;
        int periodsCount = 0;
        while (currentUsed + periodDuration <= totalShiftMinutes) {
            currentUsed += periodDuration;
            periodsCount++;

            if (periodsCount % breakAfter == 0) {
                if (currentUsed + breakDuration <= totalShiftMinutes) {
                    currentUsed += breakDuration;
                }
            }
        }

        return periodsCount;
    }
}
