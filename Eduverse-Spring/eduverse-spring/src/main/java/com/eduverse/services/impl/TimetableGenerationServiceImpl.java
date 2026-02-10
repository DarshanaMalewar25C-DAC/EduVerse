package com.eduverse.services.impl;

import com.eduverse.algorithms.GeneticAlgorithm;
import com.eduverse.algorithms.TimetableChromosome;
import com.eduverse.dtos.*;
import com.eduverse.dtos.ValidationResult;
import com.eduverse.models.*;
import com.eduverse.repositories.*;
import com.eduverse.services.ITimetableGenerationService;
import com.eduverse.services.ITimetableValidationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TimetableGenerationServiceImpl implements ITimetableGenerationService {

    @Autowired
    private TimetableRepository timetableRepository;
    @Autowired
    private TimetableEntryRepository timetableEntryRepository;
    @Autowired
    private SemesterRepository semesterRepository;
    @Autowired
    private DepartmentRepository departmentRepository;
    @Autowired
    private SubjectRepository subjectRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ClassroomRepository classroomRepository;
    @Autowired
    private TimeSlotRepository timeSlotRepository;
    @Autowired
    private ITimetableValidationService validationService;

    @Override
    @Transactional
    public TimetableGenerationResponse generateTimetables(TimetableGenerationRequest request, Integer userId) {
        try {
            Semester semester = semesterRepository.findById(request.getSemesterId()).orElse(null);
            Department department = departmentRepository.findById(request.getDepartmentId()).orElse(null);

            if (semester == null || department == null) {
                TimetableGenerationResponse res = new TimetableGenerationResponse();
                res.setSuccess(false);
                res.setMessage("Semester or Department not found");
                return res;
            }

            List<Subject> subjects = subjectRepository.findByDepartmentIdAndYear(department.getId(), request.getYear());

            List<User> allTeachers = userRepository.findByCollegeId(department.getCollegeId()).stream()
                    .filter(u -> u.getRoleId() == 3 && u.isActive())
                    .collect(Collectors.toList());

            List<Classroom> allClassrooms = classroomRepository.findByCollegeId(department.getCollegeId());

            TimeSlot shift = timeSlotRepository.findByCollegeIdAndYear(department.getCollegeId(), request.getYear())
                    .stream()
                    .findFirst().orElse(null);

            if (shift == null) {
                TimetableGenerationResponse res = new TimetableGenerationResponse();
                res.setSuccess(false);
                res.setMessage("No TimeSlot Shift defined for Year " + request.getYear());
                return res;
            }

            if (shift.getTotalPeriods() == 0) {
                shift.setTotalPeriods(validationService.calculateTotalPeriods(shift));
            }

            ValidationResult validationResult = validationService.validateTimetableGeneration(
                    subjects, allTeachers, allClassrooms, shift, 0);

            if (!validationResult.isValid()) {
                StringBuilder message = new StringBuilder("Timetable generation not possible:\n");
                validationResult.getErrors().forEach(e -> message.append(e).append("\n"));
                if (!validationResult.getWarnings().isEmpty()) {
                    message.append("\nWarnings:\n");
                    validationResult.getWarnings().forEach(w -> message.append(w).append("\n"));
                }
                TimetableGenerationResponse res = new TimetableGenerationResponse();
                res.setSuccess(false);
                res.setMessage(message.toString());
                return res;
            }

            List<TimetableEntry> existingEntries = timetableEntryRepository.findAll().stream()
                    .filter(e -> e.getTimetable().isActive()
                            && e.getTimetable().getCollegeId().equals(department.getCollegeId()))
                    .collect(Collectors.toList());

            List<TimetableDto> generatedTimetables = new ArrayList<>();

            for (int i = 0; i < request.getNumberOfSolutions(); i++) {
                TimetableDto timetable = generateSingleTimetable(
                        semester, department, subjects, allTeachers, allClassrooms,
                        shift, existingEntries, userId, i + 1, request.getYear());

                if (timetable != null)
                    generatedTimetables.add(timetable);
            }

            StringBuilder responseMsg = new StringBuilder("Generated " + generatedTimetables.size()
                    + " solution(s) for " + department.getName() + " (Year " + request.getYear() + ")");
            if (!validationResult.getWarnings().isEmpty()) {
                responseMsg.append("\n\nWarnings:\n");
                validationResult.getWarnings().forEach(w -> responseMsg.append(w).append("\n"));
            }

            TimetableGenerationResponse response = new TimetableGenerationResponse();
            response.setSuccess(true);
            response.setMessage(responseMsg.toString());
            response.setGeneratedTimetables(generatedTimetables);
            return response;

        } catch (Exception ex) {
            TimetableGenerationResponse res = new TimetableGenerationResponse();
            res.setSuccess(false);
            res.setMessage("Error: " + ex.getMessage());
            return res;
        }
    }

    @Transactional
    public TimetableDto generateSingleTimetable(
            Semester semester, Department department, List<Subject> subjects,
            List<User> teachers, List<Classroom> classrooms, TimeSlot shift,
            List<TimetableEntry> existingEntries, Integer userId, int solutionNumber, int year) {

        User user = userRepository.findById(userId).orElseThrow();

        Timetable timetable = Timetable.builder()
                .name(department.getCode() + " - Year " + year + " - " + semester.getName() + " (Sol " + solutionNumber
                        + ")")
                .semester(semester)
                .semesterId(semester.getId())
                .college(semester.getCollege())
                .collegeId(semester.getCollegeId())
                .department(department)
                .departmentId(department.getId())
                .year(year)
                .generatedBy(user)
                .generatedByUserId(userId)
                .generatedDate(LocalDateTime.now())
                .status("Draft")
                .isActive(false)
                .build();

        timetable = timetableRepository.save(timetable);

        GeneticAlgorithm ga = new GeneticAlgorithm(subjects, teachers, classrooms, shift, existingEntries);

        TimetableChromosome bestChromosome = ga.run();

        final Integer timetableId = timetable.getId();
        List<TimetableEntry> entries = bestChromosome.getGenes().stream().map(g -> TimetableEntry.builder()
                .timetable(null)
                .timetableId(timetableId)
                .subjectId(g.getSubjectId())
                .teacherId(g.getTeacherId())
                .classroomId(g.getClassroomId())
                .timeSlotId(shift.getId())
                .periodNumber(g.getPeriodNumber())
                .dayOfWeek(g.getDayOfWeek())
                .build()).collect(Collectors.toList());

        for (TimetableEntry entry : entries) {
            entry.setTimetable(timetable);
        }

        timetableEntryRepository.saveAll(entries);

        timetable.setOptimizationScore(bestChromosome.getFitness());
        timetableRepository.save(timetable);

        return getTimetableDto(timetable.getId());
    }

    @Override
    public TimetableDto getTimetableDto(Integer timetableId) {
        Timetable timetable = timetableRepository.findById(timetableId).orElse(null);
        if (timetable == null)
            return null;

        TimetableDto dto = new TimetableDto();
        dto.setId(timetable.getId());
        dto.setName(timetable.getName());
        dto.setSemesterName(timetable.getSemester() != null ? timetable.getSemester().getName() : "N/A");
        dto.setSemesterId(timetable.getSemesterId());
        dto.setDepartmentId(timetable.getDepartmentId());
        dto.setYear(timetable.getYear());
        dto.setGeneratedBy(timetable.getGeneratedBy() != null ? timetable.getGeneratedBy().getFullName() : "System");
        dto.setGeneratedDate(timetable.getGeneratedDate());
        dto.setStatus(timetable.getStatus());
        dto.setOptimizationScore(timetable.getOptimizationScore());

        if (!timetable.getEntries().isEmpty()) {
            dto.setBreakAfterPeriod(timetable.getEntries().get(0).getTimeSlot().getBreakAfterPeriod());
        }

        List<TimetableEntryDto> entryDtos = timetable.getEntries().stream().map(e -> {
            TimetableEntryDto ed = new TimetableEntryDto();
            ed.setId(e.getId());
            ed.setSubjectName(e.getSubject().getName());
            ed.setSubjectCode(e.getSubject().getCode());
            ed.setFacultyName(e.getTeacher().getFullName());
            ed.setClassroomName(e.getClassroom().getRoomNumber() + " (" + e.getClassroom().getBuilding() + ")");
            ed.setDayOfWeek(e.getDayOfWeek());
            ed.setPeriodNumber(e.getPeriodNumber());

            TimeRange range = calculatePeriodTime(e.getTimeSlot(), e.getPeriodNumber());
            ed.setStartTime(range.startTime);
            ed.setEndTime(range.endTime);
            ed.setTimeSlot(range.startTime + " - " + range.endTime);

            return ed;
        }).sorted(Comparator.comparing(TimetableEntryDto::getDayOfWeek)
                .thenComparingInt(TimetableEntryDto::getPeriodNumber))
                .collect(Collectors.toList());

        dto.setEntries(entryDtos);
        return dto;
    }

    @Override
    public List<TimetableDto> getAllTimetables(Integer collegeId, Integer userId, String role) {
        List<Timetable> timetables = timetableRepository.findByCollegeId(collegeId);
        return filterAndMapTimetables(timetables, userId, role);
    }

    @Override
    public List<TimetableDto> getTimetablesBySemester(Integer semesterId, Integer collegeId, Integer userId,
            String role) {
        List<Timetable> timetables = timetableRepository.findByCollegeId(collegeId).stream()
                .filter(t -> t.getSemesterId().equals(semesterId))
                .collect(Collectors.toList());
        return filterAndMapTimetables(timetables, userId, role);
    }

    private List<TimetableDto> filterAndMapTimetables(List<Timetable> timetables, Integer userId, String role) {
        User user = userRepository.findById(userId).orElseThrow();

        if (!role.equals("ADMIN") && !role.equals("SUPERADMIN")) {
            if (user.getDepartmentId() != null) {
                timetables = timetables.stream()
                        .filter(t -> t.getDepartmentId().equals(user.getDepartmentId()))
                        .collect(Collectors.toList());
            }
        }

        if (role.equals("TEACHER")) {
            timetables = timetables.stream()
                    .filter(t -> t.getStatus().equals("Approved"))
                    .collect(Collectors.toList());
        }

        return timetables.stream()
                .sorted(Comparator.comparing(Timetable::getGeneratedDate).reversed())
                .map(t -> {
                    TimetableDto d = new TimetableDto();
                    d.setId(t.getId());
                    d.setName(t.getName());
                    d.setSemesterName(t.getSemester() != null ? t.getSemester().getName() : "N/A");
                    d.setSemesterId(t.getSemesterId());
                    d.setDepartmentId(t.getDepartmentId());
                    d.setYear(t.getYear());
                    d.setGeneratedBy(t.getGeneratedBy() != null ? t.getGeneratedBy().getFullName() : "System");
                    d.setGeneratedDate(t.getGeneratedDate());
                    d.setStatus(t.getStatus());
                    d.setOptimizationScore(t.getOptimizationScore());
                    return d;
                }).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public boolean deleteTimetable(Integer id, Integer collegeId) {
        return timetableRepository.findById(id)
                .filter(t -> t.getCollegeId().equals(collegeId))
                .map(t -> {
                    timetableEntryRepository.deleteAll(t.getEntries());
                    timetableRepository.delete(t);
                    return true;
                }).orElse(false);
    }

    private static class TimeRange {
        String startTime;
        String endTime;
    }

    private TimeRange calculatePeriodTime(TimeSlot shift, int periodNumber) {
        LocalTime currentTime = shift.getStartTime();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm");

        for (int p = 1; p < periodNumber; p++) {
            currentTime = currentTime.plusMinutes(shift.getPeriodDurationMinutes());
            if (p % shift.getBreakAfterPeriod() == 0) {
                currentTime = currentTime.plusMinutes(shift.getBreakDurationMinutes());
            }
        }

        LocalTime endTime = currentTime.plusMinutes(shift.getPeriodDurationMinutes());
        TimeRange range = new TimeRange();
        range.startTime = currentTime.format(formatter);
        range.endTime = endTime.format(formatter);
        return range;
    }

    @Override
    @Transactional
    public boolean approveTimetable(TimetableApprovalRequest request, Integer userId) {
        Timetable timetable = timetableRepository.findById(request.getTimetableId()).orElse(null);
        if (timetable == null)
            return false;

        userRepository.findById(userId).ifPresent(u -> {
            timetable.setStatus(request.isApprove() ? "Approved" : "Rejected");
            timetable.setApprovedBy(u);
            timetable.setApprovedByUserId(userId);
            timetable.setApprovedDate(LocalDateTime.now());

            if (request.isApprove()) {
                timetable.setActive(true);
            }
            timetableRepository.save(timetable);
        });

        return true;
    }
}
