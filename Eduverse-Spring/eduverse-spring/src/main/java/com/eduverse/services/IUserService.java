package com.eduverse.services;

import com.eduverse.dtos.UserDto;
import com.eduverse.dtos.UpdateUserDto;
import com.eduverse.dtos.ServiceResponse;
import java.util.List;

public interface IUserService {
    List<UserDto> getUsersByCollege(Integer collegeId);

    List<UserDto> getTeachersByCollege(Integer collegeId);

    UserDto getUserById(Integer id, Integer collegeId);

    ServiceResponse<Void> updateUser(Integer id, UpdateUserDto dto, Integer collegeId);

    boolean deleteUser(Integer id, Integer collegeId);
}
