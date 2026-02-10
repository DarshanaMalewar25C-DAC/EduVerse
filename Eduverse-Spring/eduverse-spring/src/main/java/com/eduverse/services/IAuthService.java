package com.eduverse.services;

import com.eduverse.dtos.*;
import java.util.List;

public interface IAuthService {
    ServiceResponse<LoginResponse> registerCollege(CollegeRegistrationRequest request);

    ServiceResponse<LoginResponse> login(LoginRequest request);

    ServiceResponse<Void> registerUser(UserRegistrationRequest request, Integer registrarUserId);

    ServiceResponse<Void> forgotPassword(ForgotPasswordRequest request);

    ServiceResponse<Void> resetPassword(ResetPasswordRequest request);

    List<PendingApprovalResponse> getPendingColleges();

    List<PendingApprovalResponse> getAllColleges();

    List<PendingApprovalResponse> getPendingUsers(Integer adminUserId);

    ServiceResponse<Void> approveCollege(ApprovalRequest request);

    ServiceResponse<Void> approveUser(ApprovalRequest request);

    List<CollegeSummary> getActiveColleges();

    ServiceResponse<LoginResponse> verify2FAOtp(VerifyOtpRequest request);

    ServiceResponse<Void> sendRegistrationOtp(SendOtpRequest request);

    ServiceResponse<Void> verifyRegistrationOtp(VerifyOtpRequest request);

    // Added to match .NET parity
    ServiceResponse<Void> registerPublicUser(PublicUserRegistrationRequest request);
}
