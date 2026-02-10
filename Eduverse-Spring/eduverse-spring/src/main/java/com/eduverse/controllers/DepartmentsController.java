package com.eduverse.controllers;

import com.eduverse.dtos.*;
import com.eduverse.services.IDepartmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/departments")
@CrossOrigin(origins = "*", maxAge = 3600)
public class DepartmentsController extends BaseController {

    @Autowired
    private IDepartmentService departmentService;

    @GetMapping
    public ResponseEntity<?> getAll() {
        List<DepartmentDto> departments = departmentService.getDepartmentsByCollege(getCurrentCollegeId());
        return ResponseEntity.ok(new DataResponse<>(departments));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> create(@RequestBody CreateDepartmentDto dto) {
        ServiceResponse<DepartmentDto> response = departmentService.createDepartment(dto, getCurrentCollegeId());
        if (!response.isSuccess()) {
            return ResponseEntity.badRequest().body(new MessageResponse(response.getMessage()));
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(new DataResponse<>(response.getData()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> update(@PathVariable Integer id, @RequestBody UpdateDepartmentDto dto) {
        ServiceResponse<Void> response = departmentService.updateDepartment(id, dto, getCurrentCollegeId());
        if (!response.isSuccess()) {
            return ResponseEntity.badRequest().body(new MessageResponse(response.getMessage()));
        }
        return ResponseEntity.ok(new MessageResponse(response.getMessage()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        boolean deleted = departmentService.deleteDepartment(id, getCurrentCollegeId());
        if (!deleted) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Integer id) {
        DepartmentDto department = departmentService.getDepartmentById(id, getCurrentCollegeId());
        if (department == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(new DataResponse<>(department));
    }

    @GetMapping("/public/{collegeId}")
    public ResponseEntity<?> getByCollegePublic(@PathVariable Integer collegeId) {
        List<DepartmentDto> departments = departmentService.getDepartmentsByCollege(collegeId);
        return ResponseEntity.ok(new DataResponse<>(departments));
    }
}
