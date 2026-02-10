package com.eduverse.controllers;

import com.eduverse.dtos.*;
import com.eduverse.services.IClassroomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/classrooms")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ClassroomsController extends BaseController {

    @Autowired
    private IClassroomService classroomService;

    @GetMapping
    public ResponseEntity<?> getAll() {
        List<ClassroomDto> classrooms = classroomService.getClassroomsByCollege(getCurrentCollegeId());
        return ResponseEntity.ok(new DataResponse<>(classrooms));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> create(@RequestBody CreateClassroomDto dto) {
        ServiceResponse<ClassroomDto> response = classroomService.createClassroom(dto, getCurrentCollegeId());
        if (!response.isSuccess()) {
            return ResponseEntity.badRequest().body(new MessageResponse(response.getMessage()));
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(new DataResponse<>(response.getData()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> update(@PathVariable Integer id, @RequestBody UpdateClassroomDto dto) {
        ServiceResponse<Void> response = classroomService.updateClassroom(id, dto, getCurrentCollegeId());
        if (!response.isSuccess()) {
            return ResponseEntity.badRequest().body(new MessageResponse(response.getMessage()));
        }
        return ResponseEntity.ok(new MessageResponse(response.getMessage()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        boolean deleted = classroomService.deleteClassroom(id, getCurrentCollegeId());
        if (!deleted) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Integer id) {
        ClassroomDto classroom = classroomService.getClassroomById(id, getCurrentCollegeId());
        if (classroom == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(new DataResponse<>(classroom));
    }
}
