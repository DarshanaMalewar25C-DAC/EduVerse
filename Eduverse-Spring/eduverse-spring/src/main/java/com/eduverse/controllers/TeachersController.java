package com.eduverse.controllers;

import com.eduverse.dtos.DataResponse;
import com.eduverse.dtos.UserDto;
import com.eduverse.services.IUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teachers")
@CrossOrigin(origins = "*", maxAge = 3600)
public class TeachersController extends BaseController {

    @Autowired
    private IUserService userService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('HOD')")
    public ResponseEntity<?> getTeachers() {
        List<UserDto> teachers = userService.getTeachersByCollege(getCurrentCollegeId());
        return ResponseEntity.ok(new DataResponse<>(teachers));
    }
}
