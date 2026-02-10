package com.eduverse.services.impl;

import com.eduverse.dtos.UserDto;
import com.eduverse.dtos.UpdateUserDto;
import com.eduverse.dtos.ServiceResponse;
import com.eduverse.models.User;
import com.eduverse.repositories.UserRepository;
import com.eduverse.services.IUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements IUserService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public List<UserDto> getUsersByCollege(Integer collegeId) {
        return userRepository.findByCollegeId(collegeId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<UserDto> getTeachersByCollege(Integer collegeId) {
        return userRepository.findByCollegeId(collegeId).stream()
                .filter(u -> u.getRoleId() == 3 && u.isActive())
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public UserDto getUserById(Integer id, Integer collegeId) {
        return userRepository.findById(id)
                .filter(u -> u.getCollegeId().equals(collegeId))
                .map(this::mapToDto)
                .orElse(null);
    }

    @Override
    @Transactional
    public ServiceResponse<Void> updateUser(Integer id, UpdateUserDto dto, Integer collegeId) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty() || !userOpt.get().getCollegeId().equals(collegeId))
            return ServiceResponse.failure("User not found.");

        User user = userOpt.get();
        user.setFullName(dto.getFullName());
        user.setEmail(dto.getEmail());
        user.setDepartmentId(dto.getDepartmentId());
        user.setDesignation(dto.getDesignation());
        user.setActive(dto.isActive());

        if (dto.getPassword() != null && !dto.getPassword().isEmpty()) {
            user.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
        }

        userRepository.save(user);
        return ServiceResponse.success("User updated successfully", null);
    }

    @Override
    @Transactional
    public boolean deleteUser(Integer id, Integer collegeId) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isPresent() && userOpt.get().getCollegeId().equals(collegeId)) {
            User u = userOpt.get();
            userRepository.delete(u);
            return true;
        }
        return false;
    }

    private UserDto mapToDto(User u) {
        UserDto dto = new UserDto();
        dto.setId(u.getId());
        dto.setFullName(u.getFullName());
        dto.setEmail(u.getEmail());
        dto.setRoleId(u.getRoleId());
        dto.setRoleName(u.getRole() != null ? u.getRole().getName() : "N/A");
        dto.setDepartmentId(u.getDepartmentId());
        dto.setDepartmentName(u.getDepartment() != null ? u.getDepartment().getName() : "N/A");
        dto.setDesignation(u.getDesignation());
        dto.setActive(u.isActive());
        return dto;
    }
}
