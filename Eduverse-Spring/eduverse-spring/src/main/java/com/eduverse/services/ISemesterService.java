package com.eduverse.services;

import com.eduverse.dtos.CreateSemesterDto;
import com.eduverse.dtos.SemesterDto;
import com.eduverse.dtos.UpdateSemesterDto;
import com.eduverse.dtos.ServiceResponse;
import java.util.List;

public interface ISemesterService {
    List<SemesterDto> getSemestersByCollege(Integer collegeId);

    ServiceResponse<SemesterDto> createSemester(CreateSemesterDto dto, Integer collegeId);

    ServiceResponse<Void> updateSemester(Integer id, UpdateSemesterDto dto, Integer collegeId);

    boolean deleteSemester(Integer id, Integer collegeId);

    SemesterDto getSemesterById(Integer id, Integer collegeId);
}
