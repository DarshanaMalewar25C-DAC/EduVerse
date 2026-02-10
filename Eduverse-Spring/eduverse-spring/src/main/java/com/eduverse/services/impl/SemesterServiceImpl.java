package com.eduverse.services.impl;

import com.eduverse.dtos.CreateSemesterDto;
import com.eduverse.dtos.SemesterDto;
import com.eduverse.dtos.UpdateSemesterDto;
import com.eduverse.dtos.ServiceResponse;
import com.eduverse.models.Semester;
import com.eduverse.repositories.SemesterRepository;
import com.eduverse.services.ISemesterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class SemesterServiceImpl implements ISemesterService {
    @Autowired
    private SemesterRepository semesterRepository;

    @Override
    public List<SemesterDto> getSemestersByCollege(Integer collegeId) {
        return semesterRepository.findByCollegeId(collegeId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ServiceResponse<SemesterDto> createSemester(CreateSemesterDto dto, Integer collegeId) {
        Semester semester = Semester.builder()
                .collegeId(collegeId)
                .name(dto.getName())
                .code(dto.getCode())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())

                .build();

        Semester saved = semesterRepository.save(semester);
        return ServiceResponse.success("Semester created successfully", mapToDto(saved));
    }

    @Override
    @Transactional
    public ServiceResponse<Void> updateSemester(Integer id, UpdateSemesterDto dto, Integer collegeId) {
        Optional<Semester> semesterOpt = semesterRepository.findById(id);
        if (semesterOpt.isEmpty() || !semesterOpt.get().getCollegeId().equals(collegeId))
            return ServiceResponse.failure("Semester not found.");

        Semester semester = semesterOpt.get();
        semester.setName(dto.getName());
        semester.setCode(dto.getCode());
        semester.setStartDate(dto.getStartDate());
        semester.setEndDate(dto.getEndDate());

        semesterRepository.save(semester);
        return ServiceResponse.success("Semester updated successfully", null);
    }

    @Override
    @Transactional
    public boolean deleteSemester(Integer id, Integer collegeId) {
        Optional<Semester> semesterOpt = semesterRepository.findById(id);
        if (semesterOpt.isPresent() && semesterOpt.get().getCollegeId().equals(collegeId)) {
            semesterRepository.deleteById(id);
            return true;
        }
        return false;
    }

    @Override
    public SemesterDto getSemesterById(Integer id, Integer collegeId) {
        return semesterRepository.findById(id)
                .filter(s -> s.getCollegeId().equals(collegeId))
                .map(this::mapToDto)
                .orElse(null);
    }

    private SemesterDto mapToDto(Semester s) {
        SemesterDto dto = new SemesterDto();
        dto.setId(s.getId());
        dto.setName(s.getName());
        dto.setCode(s.getCode());
        dto.setStartDate(s.getStartDate());
        dto.setEndDate(s.getEndDate());

        return dto;
    }
}
