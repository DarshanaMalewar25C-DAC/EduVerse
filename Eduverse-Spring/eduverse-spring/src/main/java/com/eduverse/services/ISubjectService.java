package com.eduverse.services;

import com.eduverse.dtos.CreateSubjectDto;
import com.eduverse.dtos.SubjectDto;
import com.eduverse.dtos.UpdateSubjectDto;
import com.eduverse.dtos.ServiceResponse;
import java.util.List;

public interface ISubjectService {
    List<SubjectDto> getSubjectsByCollege(Integer collegeId);

    ServiceResponse<SubjectDto> createSubject(CreateSubjectDto dto, Integer collegeId);

    ServiceResponse<Void> updateSubject(Integer id, UpdateSubjectDto dto, Integer collegeId);

    boolean deleteSubject(Integer id, Integer collegeId);

    SubjectDto getSubjectById(Integer id, Integer collegeId);
}
