package com.eduverse.controllers;

import com.eduverse.dtos.*;
import com.eduverse.services.IAuthService;
import com.eduverse.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    @Autowired
    private IAuthService authService;

    @PostMapping("/register-college")
    public ResponseEntity<?> registerCollege(@RequestBody CollegeRegistrationRequest request) {
        ServiceResponse<LoginResponse> response = authService.registerCollege(request);
        if (!response.isSuccess()) {
            return ResponseEntity.badRequest().body(new MessageResponse(response.getMessage()));
        }
        return ResponseEntity.ok(new MessageResponse(response.getMessage()));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        ServiceResponse<LoginResponse> response = authService.login(request);
        if (!response.isSuccess()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse(response.getMessage()));
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/send-registration-otp")
    public ResponseEntity<?> sendRegistrationOtp(@RequestBody SendOtpRequest request) {
        ServiceResponse<Void> response = authService.sendRegistrationOtp(request);
        if (!response.isSuccess()) {
            return ResponseEntity.badRequest().body(new MessageResponse(response.getMessage()));
        }
        return ResponseEntity.ok(new MessageResponse(response.getMessage()));
    }

    @PostMapping("/verify-registration-otp")
    public ResponseEntity<?> verifyRegistrationOtp(@RequestBody VerifyOtpRequest request) {
        ServiceResponse<Void> response = authService.verifyRegistrationOtp(request);
        if (!response.isSuccess()) {
            return ResponseEntity.badRequest().body(new MessageResponse(response.getMessage()));
        }
        return ResponseEntity.ok(new MessageResponse(response.getMessage()));
    }

    @PostMapping("/verify-2fa")
    public ResponseEntity<?> verify2FA(@RequestBody VerifyOtpRequest request) {
        ServiceResponse<LoginResponse> response = authService.verify2FAOtp(request);
        if (!response.isSuccess()) {
            return ResponseEntity.badRequest().body(new MessageResponse(response.getMessage()));
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register-user")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPERADMIN')")
    public ResponseEntity<?> registerUser(@RequestBody UserRegistrationRequest request) {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal();
        ServiceResponse<Void> response = authService.registerUser(request, userDetails.getId());
        if (!response.isSuccess()) {
            return ResponseEntity.badRequest().body(new MessageResponse(response.getMessage()));
        }
        return ResponseEntity.ok(new MessageResponse(response.getMessage()));
    }

    @PostMapping("/register-public-user")
    public ResponseEntity<?> registerPublicUser(@RequestBody PublicUserRegistrationRequest request) {
        ServiceResponse<Void> response = authService.registerPublicUser(request);
        if (!response.isSuccess()) {
            return ResponseEntity.badRequest().body(new MessageResponse(response.getMessage()));
        }
        return ResponseEntity.ok(new MessageResponse(response.getMessage()));
    }

    @GetMapping("/colleges")
    public ResponseEntity<?> getColleges() {
        List<CollegeSummary> colleges = authService.getActiveColleges();
        return ResponseEntity.ok(new DataResponse<>(colleges));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok(new MessageResponse("If the email exists, a password reset link has been sent"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        ServiceResponse<Void> response = authService.resetPassword(request);
        if (!response.isSuccess()) {
            return ResponseEntity.badRequest().body(new MessageResponse(response.getMessage()));
        }
        return ResponseEntity.ok(new MessageResponse(response.getMessage()));
    }

    @GetMapping("/pending-colleges")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<?> getPendingColleges() {
        List<PendingApprovalResponse> pending = authService.getPendingColleges();
        return ResponseEntity.ok(new DataResponse<>(pending));
    }

    @GetMapping("/all-colleges")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<?> getAllColleges() {
        List<PendingApprovalResponse> colleges = authService.getAllColleges();
        return ResponseEntity.ok(new DataResponse<>(colleges));
    }

    @GetMapping("/pending-users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getPendingUsers() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal();
        List<PendingApprovalResponse> pending = authService.getPendingUsers(userDetails.getId());
        return ResponseEntity.ok(new DataResponse<>(pending));
    }

    @PostMapping("/approve-college")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<?> approveCollege(@RequestBody ApprovalRequest request) {
        ServiceResponse<Void> response = authService.approveCollege(request);
        if (!response.isSuccess()) {
            return ResponseEntity.badRequest().body(new MessageResponse(response.getMessage()));
        }
        return ResponseEntity.ok(new MessageResponse(response.getMessage()));
    }

    @PostMapping("/approve-user")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> approveUser(@RequestBody ApprovalRequest request) {
        ServiceResponse<Void> response = authService.approveUser(request);
        if (!response.isSuccess()) {
            return ResponseEntity.badRequest().body(new MessageResponse(response.getMessage()));
        }
        return ResponseEntity.ok(new MessageResponse(response.getMessage()));
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getMe() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal();
        return ResponseEntity.ok(userDetails);
    }
}


