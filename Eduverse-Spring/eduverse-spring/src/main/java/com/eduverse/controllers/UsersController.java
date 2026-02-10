package com.eduverse.controllers;

import com.eduverse.dtos.*;
import com.eduverse.services.IUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*", maxAge = 3600)
public class UsersController extends BaseController {

    @Autowired
    private IUserService userService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPERADMIN')")
    public ResponseEntity<?> getAll() {
        List<UserDto> users = userService.getUsersByCollege(getCurrentCollegeId());
        return ResponseEntity.ok(new DataResponse<>(users));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPERADMIN')")
    public ResponseEntity<?> getById(@PathVariable Integer id) {
        UserDto user = userService.getUserById(id, getCurrentCollegeId());
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(new DataResponse<>(user));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> update(@PathVariable Integer id, @RequestBody UpdateUserDto dto) {
        ServiceResponse<Void> response = userService.updateUser(id, dto, getCurrentCollegeId());
        if (!response.isSuccess()) {
            return ResponseEntity.badRequest().body(new MessageResponse(response.getMessage()));
        }
        return ResponseEntity.ok(new MessageResponse(response.getMessage()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        boolean deleted = userService.deleteUser(id, getCurrentCollegeId());
        if (!deleted) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }
}
