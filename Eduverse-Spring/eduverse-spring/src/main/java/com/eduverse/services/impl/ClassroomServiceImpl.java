package com.eduverse.services.impl;

import com.eduverse.dtos.ClassroomDto;
import com.eduverse.dtos.CreateClassroomDto;
import com.eduverse.dtos.UpdateClassroomDto;
import com.eduverse.dtos.ServiceResponse;
import com.eduverse.models.Classroom;
import com.eduverse.repositories.ClassroomRepository;
import com.eduverse.services.IClassroomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ClassroomServiceImpl implements IClassroomService {
    @Autowired
    private ClassroomRepository classroomRepository;

    @Override
    public List<ClassroomDto> getClassroomsByCollege(Integer collegeId) {
        return classroomRepository.findByCollegeId(collegeId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ServiceResponse<ClassroomDto> createClassroom(CreateClassroomDto dto, Integer collegeId) {
        boolean exists = classroomRepository.findByCollegeId(collegeId).stream()
                .anyMatch(c -> c.getRoomNumber().equalsIgnoreCase(dto.getRoomNumber()) &&
                        c.getBuilding().equalsIgnoreCase(dto.getBuilding()));

        if (exists)
            return ServiceResponse.failure("Classroom already exists.");

        Classroom classroom = Classroom.builder()
                .collegeId(collegeId)
                .roomNumber(dto.getRoomNumber())
                .building(dto.getBuilding())
                .capacity(dto.getCapacity())
                .build();

        Classroom saved = classroomRepository.save(classroom);
        return ServiceResponse.success("Classroom created successfully", mapToDto(saved));
    }

    @Override
    @Transactional
    public ServiceResponse<Void> updateClassroom(Integer id, UpdateClassroomDto dto, Integer collegeId) {
        Optional<Classroom> classroomOpt = classroomRepository.findById(id);
        if (classroomOpt.isEmpty() || !classroomOpt.get().getCollegeId().equals(collegeId))
            return ServiceResponse.failure("Classroom not found.");

        Classroom classroom = classroomOpt.get();
        classroom.setRoomNumber(dto.getRoomNumber());
        classroom.setBuilding(dto.getBuilding());
        classroom.setCapacity(dto.getCapacity());

        classroomRepository.save(classroom);
        return ServiceResponse.success("Classroom updated successfully", null);
    }

    @Override
    @Transactional
    public boolean deleteClassroom(Integer id, Integer collegeId) {
        Optional<Classroom> classroomOpt = classroomRepository.findById(id);
        if (classroomOpt.isPresent() && classroomOpt.get().getCollegeId().equals(collegeId)) {
            classroomRepository.delete(classroomOpt.get());
            return true;
        }
        return false;
    }

    @Override
    public ClassroomDto getClassroomById(Integer id, Integer collegeId) {
        return classroomRepository.findById(id)
                .filter(c -> c.getCollegeId().equals(collegeId))
                .map(this::mapToDto)
                .orElse(null);
    }

    private ClassroomDto mapToDto(Classroom c) {
        ClassroomDto dto = new ClassroomDto();
        dto.setId(c.getId());
        dto.setRoomNumber(c.getRoomNumber());
        dto.setBuilding(c.getBuilding());
        dto.setCapacity(c.getCapacity());
        return dto;
    }
}
