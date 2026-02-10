package com.eduverse.controllers;

import com.eduverse.dtos.*;
import com.eduverse.services.ISemesterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/semesters")
@CrossOrigin(origins = "*", maxAge = 3600)
public class SemestersController extends BaseController {

    @Autowired
    private ISemesterService semesterService;

    @GetMapping
    public ResponseEntity<?> getAll() {
        List<SemesterDto> semesters = semesterService.getSemestersByCollege(getCurrentCollegeId());
        return ResponseEntity.ok(new DataResponse<>(semesters));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> create(@RequestBody CreateSemesterDto dto) {
        ServiceResponse<SemesterDto> response = semesterService.createSemester(dto, getCurrentCollegeId());
        if (!response.isSuccess()) {
            return ResponseEntity.badRequest().body(new MessageResponse(response.getMessage()));
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(new DataResponse<>(response.getData()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> update(@PathVariable Integer id, @RequestBody UpdateSemesterDto dto) {
        ServiceResponse<Void> response = semesterService.updateSemester(id, dto, getCurrentCollegeId());
        if (!response.isSuccess()) {
            return ResponseEntity.badRequest().body(new MessageResponse(response.getMessage()));
        }
        return ResponseEntity.ok(new MessageResponse(response.getMessage()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        boolean deleted = semesterService.deleteSemester(id, getCurrentCollegeId());
        if (!deleted) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Integer id) {
        SemesterDto semester = semesterService.getSemesterById(id, getCurrentCollegeId());
        if (semester == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(new DataResponse<>(semester));
    }
}
