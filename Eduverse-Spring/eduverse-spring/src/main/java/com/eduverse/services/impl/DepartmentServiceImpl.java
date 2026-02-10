package com.eduverse.services.impl;

import com.eduverse.dtos.CreateDepartmentDto;
import com.eduverse.dtos.DepartmentDto;
import com.eduverse.dtos.UpdateDepartmentDto;
import com.eduverse.dtos.ServiceResponse;
import com.eduverse.models.Department;
import com.eduverse.repositories.DepartmentRepository;
import com.eduverse.services.IDepartmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class DepartmentServiceImpl implements IDepartmentService {
    @Autowired
    private DepartmentRepository departmentRepository;

    @Override
    public List<DepartmentDto> getDepartmentsByCollege(Integer collegeId) {
        return departmentRepository.findByCollegeId(collegeId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ServiceResponse<DepartmentDto> createDepartment(CreateDepartmentDto dto, Integer collegeId) {
        boolean exists = departmentRepository.findByCollegeId(collegeId).stream()
                .anyMatch(d -> d.getCode().equalsIgnoreCase(dto.getCode()));

        if (exists)
            return ServiceResponse.failure("Department code already exists.");

        Department department = Department.builder()
                .collegeId(collegeId)
                .name(dto.getName())
                .code(dto.getCode())
                .build();

        Department saved = departmentRepository.save(department);
        return ServiceResponse.success("Department created successfully", mapToDto(saved));
    }

    @Override
    @Transactional
    public ServiceResponse<Void> updateDepartment(Integer id, UpdateDepartmentDto dto, Integer collegeId) {
        Optional<Department> departmentOpt = departmentRepository.findById(id);
        if (departmentOpt.isEmpty() || !departmentOpt.get().getCollegeId().equals(collegeId))
            return ServiceResponse.failure("Department not found.");

        Department department = departmentOpt.get();

        // Check if new code already exists in another department of the same college
        boolean exists = departmentRepository.findByCollegeId(collegeId).stream()
                .anyMatch(d -> !d.getId().equals(id) && d.getCode().equalsIgnoreCase(dto.getCode()));

        if (exists)
            return ServiceResponse.failure("Department code already exists.");

        department.setName(dto.getName());
        department.setCode(dto.getCode());

        departmentRepository.save(department);
        return ServiceResponse.success("Department updated successfully", null);
    }

    @Override
    @Transactional
    public boolean deleteDepartment(Integer id, Integer collegeId) {
        Optional<Department> departmentOpt = departmentRepository.findById(id);
        if (departmentOpt.isPresent() && departmentOpt.get().getCollegeId().equals(collegeId)) {
            departmentRepository.delete(departmentOpt.get());
            return true;
        }
        return false;
    }

    @Override
    public DepartmentDto getDepartmentById(Integer id, Integer collegeId) {
        return departmentRepository.findById(id)
                .filter(d -> d.getCollegeId().equals(collegeId))
                .map(this::mapToDto)
                .orElse(null);
    }

    private DepartmentDto mapToDto(Department d) {
        DepartmentDto dto = new DepartmentDto();
        dto.setId(d.getId());
        dto.setName(d.getName());
        dto.setCode(d.getCode());
        return dto;
    }
}
