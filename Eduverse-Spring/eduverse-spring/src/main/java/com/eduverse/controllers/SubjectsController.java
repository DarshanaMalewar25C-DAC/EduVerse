package com.eduverse.controllers;

import com.eduverse.dtos.*;
import com.eduverse.services.ISubjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subjects")
@CrossOrigin(origins = "*", maxAge = 3600)
public class SubjectsController extends BaseController {

    @Autowired
    private ISubjectService subjectService;

    @GetMapping
    public ResponseEntity<?> getAll() {
        List<SubjectDto> subjects = subjectService.getSubjectsByCollege(getCurrentCollegeId());
        return ResponseEntity.ok(new DataResponse<>(subjects));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> create(@RequestBody CreateSubjectDto dto) {
        ServiceResponse<SubjectDto> response = subjectService.createSubject(dto, getCurrentCollegeId());
        if (!response.isSuccess()) {
            return ResponseEntity.badRequest().body(new MessageResponse(response.getMessage()));
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(new DataResponse<>(response.getData()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> update(@PathVariable Integer id, @RequestBody UpdateSubjectDto dto) {
        ServiceResponse<Void> response = subjectService.updateSubject(id, dto, getCurrentCollegeId());
        if (!response.isSuccess()) {
            return ResponseEntity.badRequest().body(new MessageResponse(response.getMessage()));
        }
        return ResponseEntity.ok(new MessageResponse(response.getMessage()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        boolean deleted = subjectService.deleteSubject(id, getCurrentCollegeId());
        if (!deleted) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Integer id) {
        SubjectDto subject = subjectService.getSubjectById(id, getCurrentCollegeId());
        if (subject == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(new DataResponse<>(subject));
    }
}
