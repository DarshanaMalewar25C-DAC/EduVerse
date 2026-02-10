package com.eduverse.services.impl;

import com.eduverse.dtos.*;
import com.eduverse.enums.RoleType;
import com.eduverse.models.*;
import com.eduverse.repositories.*;
import com.eduverse.security.JwtUtils;
import com.eduverse.security.services.UserDetailsImpl;
import com.eduverse.services.IAuthService;
import com.eduverse.services.IEmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AuthServiceImpl implements IAuthService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private CollegeRepository collegeRepository;
    @Autowired
    private RoleRepository roleRepository;
    @Autowired
    private EmailVerificationRepository emailVerificationRepository;
    @Autowired
    private IEmailService emailService;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private JwtUtils jwtUtils;

    @Override
    @Transactional
    public ServiceResponse<LoginResponse> registerCollege(CollegeRegistrationRequest request) {
        if (collegeRepository.findByCollegeCode(request.getCollegeCode()).isPresent()) {
            return ServiceResponse.failure("College code already exists");
        }
        if (userRepository.findByEmail(request.getAdminEmail()).isPresent()) {
            return ServiceResponse.failure("Email already registered");
        }

        Optional<EmailVerification> verification = emailVerificationRepository.findById(request.getAdminEmail());
        if (verification.isEmpty() || !verification.get().isVerified()) {
            return ServiceResponse.failure("Please verify your email address first");
        }

        College college = College.builder()
                .collegeName(request.getCollegeName())
                .collegeCode(request.getCollegeCode())
                .address(request.getAddress())
                .state(request.getState())
                .contactEmail(request.getContactEmail())
                .contactPhone(request.getContactPhone())
                .establishedYear(request.getEstablishedYear())
                .isActive(true)
                .isApproved(false)
                .createdAt(LocalDateTime.now())
                .build();

        college = collegeRepository.save(college);

        Role adminRole = roleRepository.findById(RoleType.ADMIN.getValue()).orElseThrow();
        User admin = User.builder()
                .college(college)
                .collegeId(college.getId())
                .fullName(request.getAdminName())
                .email(request.getAdminEmail())
                .passwordHash(passwordEncoder.encode(request.getAdminPassword()))
                .role(adminRole)
                .roleId(adminRole.getId())
                .isActive(true)
                .isApproved(false)
                .isEmailVerified(true)
                .createdAt(LocalDateTime.now())
                .build();

        userRepository.save(admin);
        emailVerificationRepository.delete(verification.get());

        return ServiceResponse.success("Registration submitted. Your account is pending approval.", null);
    }

    @Override
    public ServiceResponse<LoginResponse> login(LoginRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isEmpty() || !passwordEncoder.matches(request.getPassword(), userOpt.get().getPasswordHash())) {
            return ServiceResponse.failure("Invalid email or password");
        }

        User user = userOpt.get();
        if (!user.isActive()) {
            return ServiceResponse.failure("Account is inactive");
        }
        if (!user.getCollege().isActive()) {
            return ServiceResponse.failure("College is inactive");
        }

        if (user.getRoleId() != RoleType.SUPERADMIN.getValue()) {
            if (!user.isApproved())
                return ServiceResponse.failure("Your account is pending approval");
            if (!user.getCollege().isApproved())
                return ServiceResponse.failure("Your college registration is pending approval");
        }

        if (user.getRoleId() == RoleType.SUPERADMIN.getValue()) {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);

            user.setLastLogin(LocalDateTime.now());
            userRepository.save(user);

            LoginResponse response = LoginResponse.builder()
                    .token(jwt)
                    .userId(user.getId())
                    .fullName(user.getFullName())
                    .email(user.getEmail())
                    .role(user.getRole().getName())
                    .roleId(user.getRoleId())
                    .collegeId(user.getCollegeId())
                    .collegeName(user.getCollege().getCollegeName())
                    .collegeCode(user.getCollege().getCollegeCode())
                    .departmentId(user.getDepartmentId())
                    .requires2FA(false)
                    .build();

            return ServiceResponse.success("Login successful", response);
        }

        if (!user.isEmailVerified())
            return ServiceResponse.failure("Please verify your email first");

        String otpCode = generateOtp();
        user.setOtpCode(otpCode);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(5));
        userRepository.save(user);

        emailService.sendEmailAsync(user.getEmail(), "EduVerse - Login OTP",
                "<h3>Login Verification</h3><p>Your OTP for login is: <strong>" + otpCode
                        + "</strong></p><p>Valid for 5 minutes.</p>");

        return ServiceResponse.success("OTP sent to your email", LoginResponse.builder().requires2FA(true).build());
    }

    @Override
    @Transactional
    public ServiceResponse<Void> registerUser(UserRegistrationRequest request, Integer registrarUserId) {
        User registrar = userRepository.findById(registrarUserId).orElseThrow();
        if (!registrar.isActive())
            return ServiceResponse.failure("Unauthorized");

        if (registrar.getRoleId() == RoleType.SUPERADMIN.getValue() && request.getRoleId() != RoleType.ADMIN.getValue())
            return ServiceResponse.failure("SuperAdmin can only register Admins");

        if (registrar.getRoleId() == RoleType.ADMIN.getValue() &&
                request.getRoleId() != RoleType.HOD.getValue() && request.getRoleId() != RoleType.TEACHER.getValue())
            return ServiceResponse.failure("Admin can only register HODs and Teachers");

        if (request.getRoleId() == RoleType.HOD.getValue() || request.getRoleId() == RoleType.TEACHER.getValue()) {
            if (request.getDepartmentId() == null)
                return ServiceResponse.failure("Department is required");
            if (request.getDesignation() == null || request.getDesignation().isEmpty())
                return ServiceResponse.failure("Designation is required");
        }

        if (userRepository.findByEmail(request.getEmail()).isPresent())
            return ServiceResponse.failure("Email already registered");

        Role role = roleRepository.findById(request.getRoleId()).orElseThrow();
        User user = User.builder()
                .college(registrar.getCollege())
                .collegeId(registrar.getCollegeId())
                .fullName(request.getFullName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .roleId(role.getId())
                .departmentId(request.getDepartmentId())
                .designation(request.getDesignation())
                .isActive(true)
                .isApproved(registrar.getRoleId() == RoleType.ADMIN.getValue())
                .isEmailVerified(true)
                .createdAt(LocalDateTime.now())
                .build();

        userRepository.save(user);
        return ServiceResponse.success("User registered successfully", null);
    }

    @Override
    public ServiceResponse<Void> forgotPassword(ForgotPasswordRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isEmpty())
            return ServiceResponse.success("If the email exists, a password reset link has been sent", null);

        User user = userOpt.get();
        String resetToken = UUID.randomUUID().toString();
        user.setPasswordResetToken(resetToken);
        user.setPasswordResetTokenExpiry(LocalDateTime.now().plusHours(1));
        userRepository.save(user);

        String resetLink = "http://localhost:5173/reset-password?token=" + resetToken;
        String emailBody = "<h3>Password Reset Request</h3><p>Please click the following link to reset your password:</p><p><a href='"
                + resetLink + "'>Reset Password</a></p><p>This link will expire in 1 hour.</p>";

        emailService.sendEmailAsync(user.getEmail(), "EduVerse - Password Reset", emailBody);

        return ServiceResponse.success("If the email exists, a password reset link has been sent", null);
    }

    @Override
    public ServiceResponse<Void> resetPassword(ResetPasswordRequest request) {
        Optional<User> userOpt = userRepository.findByPasswordResetToken(request.getToken());
        if (userOpt.isEmpty() || userOpt.get().getPasswordResetTokenExpiry() == null ||
                userOpt.get().getPasswordResetTokenExpiry().isBefore(LocalDateTime.now())) {
            return ServiceResponse.failure("Invalid or expired reset token");
        }

        User user = userOpt.get();
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setPasswordResetToken(null);
        user.setPasswordResetTokenExpiry(null);
        userRepository.save(user);

        return ServiceResponse.success("Password reset successfully", null);
    }

    @Override
    public List<PendingApprovalResponse> getPendingColleges() {
        return collegeRepository.findAll().stream()
                .filter(c -> !c.isApproved() && c.isActive())
                .map(c -> {
                    User admin = c.getUsers().stream()
                            .filter(u -> u.getRoleId() == RoleType.ADMIN.getValue())
                            .findFirst().orElse(null);
                    PendingApprovalResponse res = new PendingApprovalResponse();
                    res.setId(c.getId());
                    res.setName(c.getCollegeName());
                    res.setEmail(admin != null ? admin.getEmail() : "");
                    res.setCollegeName(c.getCollegeName());
                    res.setCollegeCode(c.getCollegeCode());
                    res.setAddress(c.getAddress());
                    res.setState(c.getState());
                    res.setContactEmail(c.getContactEmail());
                    res.setContactPhone(c.getContactPhone());
                    res.setEstablishedYear(c.getEstablishedYear());
                    res.setAdminName(admin != null ? admin.getFullName() : "");
                    res.setCreatedAt(c.getCreatedAt());
                    return res;
                }).collect(Collectors.toList());
    }

    @Override
    public List<PendingApprovalResponse> getAllColleges() {
        return collegeRepository.findAll().stream()
                .filter(c -> c.isApproved() && c.isActive())
                .map(c -> {
                    User admin = c.getUsers().stream()
                            .filter(u -> u.getRoleId() == RoleType.ADMIN.getValue())
                            .findFirst().orElse(null);
                    PendingApprovalResponse res = new PendingApprovalResponse();
                    res.setId(c.getId());
                    res.setName(c.getCollegeName());
                    res.setEmail(admin != null ? admin.getEmail() : "");
                    res.setCollegeName(c.getCollegeName());
                    res.setCollegeCode(c.getCollegeCode());
                    res.setAddress(c.getAddress());
                    res.setState(c.getState());
                    res.setContactEmail(c.getContactEmail());
                    res.setContactPhone(c.getContactPhone());
                    res.setEstablishedYear(c.getEstablishedYear());
                    res.setAdminName(admin != null ? admin.getFullName() : "");
                    res.setCreatedAt(c.getCreatedAt());
                    return res;
                }).collect(Collectors.toList());
    }

    @Override
    public List<PendingApprovalResponse> getPendingUsers(Integer adminUserId) {
        User admin = userRepository.findById(adminUserId).orElseThrow();
        if (admin.getRoleId() != RoleType.ADMIN.getValue())
            return new ArrayList<>();

        return userRepository.findByCollegeId(admin.getCollegeId()).stream()
                .filter(u -> !u.isApproved() && u.isActive() &&
                        (u.getRoleId() == RoleType.HOD.getValue() || u.getRoleId() == RoleType.TEACHER.getValue()))
                .map(u -> {
                    PendingApprovalResponse res = new PendingApprovalResponse();
                    res.setId(u.getId());
                    res.setName(u.getFullName());
                    res.setEmail(u.getEmail());
                    res.setRole(u.getRole().getName());
                    res.setCreatedAt(u.getCreatedAt());
                    return res;
                }).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ServiceResponse<Void> approveCollege(ApprovalRequest request) {
        College college = collegeRepository.findById(request.getId()).orElse(null);
        if (college == null)
            return ServiceResponse.failure("College not found");

        if (request.isApprove()) {
            college.setApproved(true);
            college.setActive(true);
            college.getUsers().stream()
                    .filter(u -> u.getRoleId() == RoleType.ADMIN.getValue())
                    .forEach(u -> {
                        u.setApproved(true);
                        u.setActive(true);
                    });
        } else {
            college.setActive(false);
            college.getUsers().stream()
                    .forEach(u -> u.setActive(false));
        }

        collegeRepository.save(college);
        return ServiceResponse.success(request.isApprove() ? "College approved successfully" : "College rejected",
                null);
    }

    @Override
    @Transactional
    public ServiceResponse<Void> approveUser(ApprovalRequest request) {
        User user = userRepository.findById(request.getId()).orElse(null);
        if (user == null)
            return ServiceResponse.failure("User not found");

        if (request.isApprove()) {
            user.setApproved(true);
            user.setActive(true);
        } else {
            user.setActive(false);
        }

        userRepository.save(user);
        return ServiceResponse.success(request.isApprove() ? "User approved successfully" : "User rejected", null);
    }

    @Override
    public List<CollegeSummary> getActiveColleges() {
        return collegeRepository.findAll().stream()
                .filter(c -> c.isActive() && c.isApproved() && !c.getCollegeCode().equals("SUPERADMIN"))
                .map(c -> {
                    CollegeSummary summary = new CollegeSummary();
                    summary.setId(c.getId());
                    summary.setName(c.getCollegeName());
                    return summary;
                }).collect(Collectors.toList());
    }

    @Override
    public ServiceResponse<LoginResponse> verify2FAOtp(VerifyOtpRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isEmpty())
            return ServiceResponse.failure("User not found");

        User user = userOpt.get();
        if (!request.getOtp().equals(user.getOtpCode()) || user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            return ServiceResponse.failure("Invalid or expired OTP");
        }

        user.setEmailVerified(true);
        user.setOtpCode(null);
        user.setOtpExpiry(null);
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        UserDetailsImpl userPrincipal = UserDetailsImpl.build(user);
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                userPrincipal, null, userPrincipal.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        LoginResponse response = LoginResponse.builder()
                .token(jwt)
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().getName())
                .roleId(user.getRoleId())
                .collegeId(user.getCollegeId())
                .collegeName(user.getCollege().getCollegeName())
                .collegeCode(user.getCollege().getCollegeCode())
                .departmentId(user.getDepartmentId())
                .build();

        return ServiceResponse.success("Login successful", response);
    }

    @Override
    @Transactional
    public ServiceResponse<Void> sendRegistrationOtp(SendOtpRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent())
            return ServiceResponse.failure("Email already registered");

        String otp = generateOtp();
        EmailVerification verification = emailVerificationRepository.findById(request.getEmail())
                .orElse(EmailVerification.builder().email(request.getEmail()).build());

        verification.setOtpCode(otp);
        verification.setExpiry(LocalDateTime.now().plusMinutes(10));
        verification.setVerified(false);
        verification.setUpdatedAt(LocalDateTime.now());

        emailVerificationRepository.save(verification);

        emailService.sendEmailAsync(request.getEmail(), "EduVerse - Email Verification OTP",
                "<h3>Email Verification</h3><p>Your registration OTP is: <strong>" + otp
                        + "</strong></p><p>Valid for 10 minutes.</p>");

        return ServiceResponse.success("OTP sent successfully", null);
    }

    @Override
    @Transactional
    public ServiceResponse<Void> verifyRegistrationOtp(VerifyOtpRequest request) {
        Optional<EmailVerification> verification = emailVerificationRepository.findById(request.getEmail());
        if (verification.isEmpty() || !verification.get().getOtpCode().equals(request.getOtp()) ||
                verification.get().getExpiry().isBefore(LocalDateTime.now())) {
            return ServiceResponse.failure("Invalid or expired OTP");
        }

        EmailVerification v = verification.get();
        v.setVerified(true);
        v.setUpdatedAt(LocalDateTime.now());
        emailVerificationRepository.save(v);

        return ServiceResponse.success("Email verified successfully", null);
    }

    @Override
    @Transactional
    public ServiceResponse<Void> registerPublicUser(PublicUserRegistrationRequest request) {
        Optional<College> collegeOpt = collegeRepository.findById(request.getCollegeId());
        if (collegeOpt.isEmpty() || !collegeOpt.get().isActive() || !collegeOpt.get().isApproved()) {
            return ServiceResponse.failure("College not found or inactive");
        }

        if (request.getRoleId() != RoleType.HOD.getValue() && request.getRoleId() != RoleType.TEACHER.getValue()) {
            return ServiceResponse.failure("Invalid role for self-registration");
        }

        if (request.getDepartmentId() == null) {
            return ServiceResponse.failure("Department is required");
        }

        if (request.getDesignation() == null || request.getDesignation().isEmpty()) {
            return ServiceResponse.failure("Designation is required");
        }

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ServiceResponse.failure("Email already registered");
        }

        Optional<EmailVerification> verification = emailVerificationRepository.findById(request.getEmail());
        if (verification.isEmpty() || !verification.get().isVerified()) {
            return ServiceResponse.failure("Please verify your email address first");
        }

        Role role = roleRepository.findById(request.getRoleId()).orElseThrow();
        User user = User.builder()
                .college(collegeOpt.get())
                .collegeId(collegeOpt.get().getId())
                .fullName(request.getFullName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .roleId(role.getId())
                .departmentId(request.getDepartmentId())
                .designation(request.getDesignation())
                .isActive(true)
                .isApproved(false)
                .isEmailVerified(true)
                .createdAt(LocalDateTime.now())
                .build();

        userRepository.save(user);
        emailVerificationRepository.delete(verification.get());

        return ServiceResponse.success("Registration successful. Please wait for official approval.", null);
    }

    private String generateOtp() {
        return String.valueOf(new Random().nextInt(900000) + 100000);
    }
}
