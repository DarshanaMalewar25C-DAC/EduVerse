package com.eduverse.services;

import com.eduverse.dtos.ClassroomDto;
import com.eduverse.dtos.CreateClassroomDto;
import com.eduverse.dtos.UpdateClassroomDto;
import com.eduverse.dtos.ServiceResponse;
import java.util.List;

public interface IClassroomService {
    List<ClassroomDto> getClassroomsByCollege(Integer collegeId);

    ServiceResponse<ClassroomDto> createClassroom(CreateClassroomDto dto, Integer collegeId);

    ServiceResponse<Void> updateClassroom(Integer id, UpdateClassroomDto dto, Integer collegeId);

    boolean deleteClassroom(Integer id, Integer collegeId);

    ClassroomDto getClassroomById(Integer id, Integer collegeId);
}
