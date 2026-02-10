package com.eduverse.services.impl;

import com.eduverse.dtos.CreateSubjectDto;
import com.eduverse.dtos.SubjectDto;
import com.eduverse.dtos.UpdateSubjectDto;
import com.eduverse.dtos.ServiceResponse;
import com.eduverse.models.Subject;
import com.eduverse.models.User;
import com.eduverse.repositories.SubjectRepository;
import com.eduverse.repositories.UserRepository;
import com.eduverse.services.ISubjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class SubjectServiceImpl implements ISubjectService {
    @Autowired
    private SubjectRepository subjectRepository;
    @Autowired
    private UserRepository userRepository;

    @Override
    public List<SubjectDto> getSubjectsByCollege(Integer collegeId) {
        return subjectRepository.findByCollegeId(collegeId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ServiceResponse<SubjectDto> createSubject(CreateSubjectDto dto, Integer collegeId) {
        boolean exists = subjectRepository.findByCollegeId(collegeId).stream()
                .anyMatch(s -> s.getCode().equalsIgnoreCase(dto.getCode()));

        if (exists)
            return ServiceResponse.failure("Subject code already exists in this college.");

        if (dto.getTeacherId() != null) {
            Optional<User> teacherOpt = userRepository.findById(dto.getTeacherId());
            if (teacherOpt.isEmpty() || !teacherOpt.get().getCollegeId().equals(collegeId)
                    || teacherOpt.get().getRoleId() != 3 || !teacherOpt.get().isActive())
                return ServiceResponse.failure("Invalid teacher assignment.");

            if (!teacherOpt.get().getDepartmentId().equals(dto.getDepartmentId()))
                return ServiceResponse.failure("Assigned teacher does not belong to the selected department.");

            boolean teacherAlreadyAssigned = subjectRepository.findByCollegeId(collegeId).stream()
                    .anyMatch(s -> s.getTeacherId() != null && s.getTeacherId().equals(dto.getTeacherId()));

            if (teacherAlreadyAssigned)
                return ServiceResponse.failure("This teacher is already assigned to another subject.");
        }

        Subject subject = Subject.builder()
                .collegeId(collegeId)
                .name(dto.getName())
                .code(dto.getCode())
                .departmentId(dto.getDepartmentId())
                .credits(dto.getCredits())
                .classesPerWeek(dto.getClassesPerWeek())
                .year(dto.getYear())
                .durationMinutes(dto.getDurationMinutes())
                .teacherId(dto.getTeacherId())
                .build();

        Subject saved = subjectRepository.save(subject);
        return ServiceResponse.success("Subject created successfully", mapToDto(saved));
    }

    @Override
    @Transactional
    public ServiceResponse<Void> updateSubject(Integer id, UpdateSubjectDto dto, Integer collegeId) {
        Optional<Subject> subjectOpt = subjectRepository.findById(id);
        if (subjectOpt.isEmpty() || !subjectOpt.get().getCollegeId().equals(collegeId))
            return ServiceResponse.failure("Subject not found.");

        Subject subject = subjectOpt.get();

        if (dto.getTeacherId() != null) {
            Optional<User> teacherOpt = userRepository.findById(dto.getTeacherId());
            if (teacherOpt.isEmpty() || !teacherOpt.get().getCollegeId().equals(collegeId)
                    || teacherOpt.get().getRoleId() != 3 || !teacherOpt.get().isActive())
                return ServiceResponse.failure("Invalid teacher assignment.");

            if (!teacherOpt.get().getDepartmentId().equals(dto.getDepartmentId()))
                return ServiceResponse.failure("Assigned teacher does not belong to the selected department.");

            boolean teacherAlreadyAssigned = subjectRepository.findByCollegeId(collegeId).stream()
                    .anyMatch(s -> s.getTeacherId() != null && s.getTeacherId().equals(dto.getTeacherId())
                            && !s.getId().equals(id));

            if (teacherAlreadyAssigned)
                return ServiceResponse.failure("This teacher is already assigned to another subject.");
        }

        // Check if new code already exists
        boolean codeExists = subjectRepository.findByCollegeId(collegeId).stream()
                .anyMatch(s -> s.getCode().equalsIgnoreCase(dto.getCode()) && !s.getId().equals(id));
        if (codeExists)
            return ServiceResponse.failure("Subject code already exists in this college.");

        subject.setName(dto.getName());
        subject.setCode(dto.getCode());
        subject.setDepartmentId(dto.getDepartmentId());
        subject.setCredits(dto.getCredits());
        subject.setClassesPerWeek(dto.getClassesPerWeek());
        subject.setYear(dto.getYear());
        subject.setDurationMinutes(dto.getDurationMinutes());
        subject.setTeacherId(dto.getTeacherId());

        subjectRepository.save(subject);
        return ServiceResponse.success("Subject updated successfully", null);
    }

    @Override
    public boolean deleteSubject(Integer id, Integer collegeId) {
        Optional<Subject> subjectOpt = subjectRepository.findById(id);
        if (subjectOpt.isPresent() && subjectOpt.get().getCollegeId().equals(collegeId)) {
            subjectRepository.deleteById(id);
            return true;
        }
        return false;
    }

    @Override
    public SubjectDto getSubjectById(Integer id, Integer collegeId) {
        return subjectRepository.findById(id)
                .filter(s -> s.getCollegeId().equals(collegeId))
                .map(this::mapToDto)
                .orElse(null);
    }

    private SubjectDto mapToDto(Subject subject) {
        SubjectDto dto = new SubjectDto();
        dto.setId(subject.getId());
        dto.setName(subject.getName());
        dto.setCode(subject.getCode());
        dto.setDepartmentId(subject.getDepartmentId());
        dto.setDepartmentName(subject.getDepartment() != null ? subject.getDepartment().getName() : "N/A");
        dto.setCredits(subject.getCredits());
        dto.setClassesPerWeek(subject.getClassesPerWeek());
        dto.setYear(subject.getYear());
        dto.setDurationMinutes(subject.getDurationMinutes());
        dto.setTeacherId(subject.getTeacherId());
        dto.setTeacherName(subject.getTeacher() != null ? subject.getTeacher().getFullName() : null);
        return dto;
    }
}
