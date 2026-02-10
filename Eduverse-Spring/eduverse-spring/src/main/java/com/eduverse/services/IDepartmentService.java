package com.eduverse.services;

import com.eduverse.dtos.CreateDepartmentDto;
import com.eduverse.dtos.DepartmentDto;
import com.eduverse.dtos.UpdateDepartmentDto;
import com.eduverse.dtos.ServiceResponse;
import java.util.List;

public interface IDepartmentService {
    List<DepartmentDto> getDepartmentsByCollege(Integer collegeId);

    ServiceResponse<DepartmentDto> createDepartment(CreateDepartmentDto dto, Integer collegeId);

    ServiceResponse<Void> updateDepartment(Integer id, UpdateDepartmentDto dto, Integer collegeId);

    boolean deleteDepartment(Integer id, Integer collegeId);

    DepartmentDto getDepartmentById(Integer id, Integer collegeId);
}
