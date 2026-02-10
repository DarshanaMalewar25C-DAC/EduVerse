package com.eduverse.controllers;

import com.eduverse.dtos.*;
import com.eduverse.services.ITimetableGenerationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/timetable")
@CrossOrigin(origins = "*", maxAge = 3600)
public class TimetableController extends BaseController {

    @Autowired
    private ITimetableGenerationService timetableService;

    @GetMapping
    public ResponseEntity<?> getAll() {
        List<TimetableDto> timetables = timetableService.getAllTimetables(getCurrentCollegeId(), getCurrentUserId(),
                getCurrentRole());
        return ResponseEntity.ok(new DataResponse<>(timetables));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Integer id) {
        TimetableDto timetable = timetableService.getTimetableDto(id);
        if (timetable == null)
            return ResponseEntity.notFound().build();
        return ResponseEntity.ok(new DataResponse<>(timetable));
    }

    @PostMapping("/generate")
    public ResponseEntity<?> generate(@RequestBody TimetableGenerationRequest request) {
        TimetableGenerationResponse response = timetableService.generateTimetables(request, getCurrentUserId());
        if (!response.isSuccess())
            return ResponseEntity.badRequest().body(response);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/approve")
    @PreAuthorize("hasRole('HOD')")
    public ResponseEntity<?> approve(@RequestBody TimetableApprovalRequest request) {
        boolean success = timetableService.approveTimetable(request, getCurrentUserId());
        if (!success)
            return ResponseEntity.notFound().build();
        return ResponseEntity.ok(new MessageResponse("Timetable approval status updated"));
    }

    @GetMapping("/semester/{semesterId}")
    public ResponseEntity<?> getBySemester(@PathVariable Integer semesterId) {
        List<TimetableDto> timetables = timetableService.getTimetablesBySemester(semesterId, getCurrentCollegeId(),
                getCurrentUserId(), getCurrentRole());
        return ResponseEntity.ok(new DataResponse<>(timetables));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        boolean success = timetableService.deleteTimetable(id, getCurrentCollegeId());
        if (!success) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }
}
