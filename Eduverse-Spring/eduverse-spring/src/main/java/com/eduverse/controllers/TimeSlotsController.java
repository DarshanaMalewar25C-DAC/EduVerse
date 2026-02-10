package com.eduverse.controllers;

import com.eduverse.dtos.*;
import com.eduverse.services.ITimeSlotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/timeslots")
@CrossOrigin(origins = "*", maxAge = 3600)
public class TimeSlotsController extends BaseController {

    @Autowired
    private ITimeSlotService timeSlotService;

    @GetMapping
    public ResponseEntity<?> getAll() {
        List<TimeSlotDto> timeSlots = timeSlotService.getTimeSlotsByCollege(getCurrentCollegeId());
        return ResponseEntity.ok(new DataResponse<>(timeSlots));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> create(@RequestBody CreateTimeSlotDto dto) {
        ServiceResponse<TimeSlotDto> response = timeSlotService.createTimeSlot(dto, getCurrentCollegeId());
        if (!response.isSuccess()) {
            return ResponseEntity.badRequest().body(new MessageResponse(response.getMessage()));
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(new DataResponse<>(response.getData()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> update(@PathVariable Integer id, @RequestBody UpdateTimeSlotDto dto) {
        ServiceResponse<Void> response = timeSlotService.updateTimeSlot(id, dto, getCurrentCollegeId());
        if (!response.isSuccess()) {
            return ResponseEntity.badRequest().body(new MessageResponse(response.getMessage()));
        }
        return ResponseEntity.ok(new MessageResponse(response.getMessage()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        boolean deleted = timeSlotService.deleteTimeSlot(id, getCurrentCollegeId());
        if (!deleted) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Integer id) {
        TimeSlotDto timeSlot = timeSlotService.getTimeSlotById(id, getCurrentCollegeId());
        if (timeSlot == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(new DataResponse<>(timeSlot));
    }
}
