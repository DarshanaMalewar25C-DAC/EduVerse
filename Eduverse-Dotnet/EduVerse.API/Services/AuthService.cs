using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using EduVerse.API.Data;
using EduVerse.API.DTOs;
using EduVerse.API.Models;
using EduVerse.API.Enums;

namespace EduVerse.API.Services
{
    public class AuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _config;
        private readonly IEmailService _emailService;

        public AuthService(ApplicationDbContext context, IConfiguration config, IEmailService emailService)
        {
            _context = context;
            _config = config;
            _emailService = emailService;
        }

        public async Task<(bool Success, string Message, LoginResponse? Response)>
            RegisterCollegeAsync(CollegeRegistrationRequest request)
        {
            if (await _context.Colleges.AnyAsync(c => c.CollegeCode == request.CollegeCode))
                return (false, "College code already exists", null);

            if (await _context.Users.AnyAsync(u => u.Email == request.AdminEmail))
                return (false, "Email already registered", null);

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {

                var verification = await _context.EmailVerifications
                    .FirstOrDefaultAsync(v => v.Email == request.AdminEmail && v.IsVerified);
                if (verification == null)
                    return (false, "Please verify your email address first", null);

                var college = new College
                {
                    CollegeName = request.CollegeName,
                    CollegeCode = request.CollegeCode,
                    Address = request.Address,
                    State = request.State,
                    ContactEmail = request.ContactEmail,
                    ContactPhone = request.ContactPhone,
                    EstablishedYear = request.EstablishedYear,
                    IsActive = true,
                    IsApproved = false,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Colleges.Add(college);
                await _context.SaveChangesAsync();

                var admin = new User
                {
                    CollegeId = college.Id,
                    FullName = request.AdminName,
                    Email = request.AdminEmail,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.AdminPassword),
                    RoleId = (int)RoleType.Admin,
                    IsActive = true,
                    IsApproved = false,
                    IsEmailVerified = true,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Users.Add(admin);
                await _context.SaveChangesAsync();

                _context.EmailVerifications.Remove(verification);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                return (true, "Registration submitted. Your account is pending approval.", null);
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<(bool Success, string Message, LoginResponse? Response)>
            LoginAsync(LoginRequest request)
        {
            var user = await _context.Users
                .Include(u => u.College)
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                return (false, "Invalid email or password", null);

            if (!user.IsActive || !user.College.IsActive)
                return (false, "Account or college inactive", null);

            if (user.RoleId != (int)RoleType.SuperAdmin)
            {
                if (!user.IsApproved)
                    return (false, "Your account is pending approval", null);

                if (!user.College.IsApproved)
                    return (false, "Your college registration is pending approval", null);
            }

            if (user.RoleId == (int)RoleType.SuperAdmin)
            {
                user.LastLogin = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                var token = GenerateJwtToken(user, user.College, user.Role.Name);

                return (true, "Login successful", new LoginResponse
                {
                    Token = token,
                    UserId = user.Id,
                    FullName = user.FullName,
                    Email = user.Email,
                    Role = user.Role.Name,
                    RoleId = user.RoleId,
                    CollegeId = user.CollegeId,
                    CollegeName = user.College.CollegeName,
                    CollegeCode = user.College.CollegeCode,
                    DepartmentId = user.DepartmentId,
                    Requires2FA = false
                });
            }

            if (!user.IsEmailVerified)
                return (false, "Please verify your email first", null);

            var otpCode = GenerateOtp();
            user.OtpCode = otpCode;
            user.OtpExpiry = DateTime.UtcNow.AddMinutes(5);
            await _context.SaveChangesAsync();

            await _emailService.SendEmailAsync(user.Email, "EduVerse - Login OTP",
                $"<h3>Login Verification</h3><p>Your OTP for login is: <strong>{otpCode}</strong></p><p>Valid for 5 minutes.</p>");

            Console.WriteLine($"Login OTP for {user.Email}: {otpCode}");

            return (true, "OTP sent to your email", new LoginResponse { Requires2FA = true });
        }

        public async Task<(bool Success, string Message)>
            RegisterUserAsync(UserRegistrationRequest request, int registrarUserId)
        {
            var registrar = await _context.Users
                .Include(u => u.College)
                .FirstOrDefaultAsync(u => u.Id == registrarUserId && u.IsActive);

            if (registrar == null)
                return (false, "Unauthorized");

            if (registrar.RoleId == (int)RoleType.SuperAdmin && request.RoleId != (int)RoleType.Admin)
                return (false, "SuperAdmin can only register Admins");

            if (registrar.RoleId == (int)RoleType.Admin &&
                request.RoleId is not (int)RoleType.HOD and not (int)RoleType.Teacher)
                return (false, "Admin can only register HODs and Teachers");

            if (request.RoleId is (int)RoleType.HOD or (int)RoleType.Teacher)
            {
                if (request.DepartmentId == null)
                    return (false, "Department is required");
                if (string.IsNullOrEmpty(request.Designation))
                    return (false, "Designation is required");
            }

            if (await _context.Users.AnyAsync(u =>
                u.Email == request.Email && u.CollegeId == registrar.CollegeId))
                return (false, "Email already registered");

            var user = new User
            {
                CollegeId = registrar.CollegeId,
                FullName = request.FullName,
                Email = request.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                RoleId = request.RoleId,
                DepartmentId = request.DepartmentId,
                Designation = request.Designation,
                IsActive = true,
                IsApproved = registrar.RoleId == (int)RoleType.Admin,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return (true, "User registered successfully");
        }

        public async Task<(bool Success, string Message)> ForgotPasswordAsync(ForgotPasswordRequest request)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null)
                return (true, "If the email exists, a password reset link has been sent");

            var resetToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));
            user.PasswordResetToken = resetToken;
            user.PasswordResetTokenExpiry = DateTime.UtcNow.AddHours(1);

            await _context.SaveChangesAsync();

            var resetLink = $"http://localhost:5173/reset-password?token={System.Net.WebUtility.UrlEncode(resetToken)}";
            var emailBody = $@"
                <h3>Password Reset Request</h3>
                <p>Please click the following link to reset your password:</p>
                <p><a href='{resetLink}'>Reset Password</a></p>
                <p>This link will expire in 1 hour.</p>";

            await _emailService.SendEmailAsync(user.Email, "EduVerse - Password Reset", emailBody);

            Console.WriteLine($"[DEBUG] Password reset link for {user.Email}: {resetLink}");
            
            return (true, "If the email exists, a password reset link has been sent");
        }

        public async Task<(bool Success, string Message)> ResetPasswordAsync(ResetPasswordRequest request)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.PasswordResetToken == request.Token);

            if (user == null || user.PasswordResetTokenExpiry == null ||
                user.PasswordResetTokenExpiry < DateTime.UtcNow)
                return (false, "Invalid or expired reset token");

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            user.PasswordResetToken = null;
            user.PasswordResetTokenExpiry = null;

            await _context.SaveChangesAsync();

            return (true, "Password reset successfully");
        }

        public async Task<List<PendingApprovalResponse>> GetPendingCollegesAsync()
        {
            var pendingColleges = await _context.Colleges
                .Where(c => !c.IsApproved && c.IsActive)
                .Include(c => c.Users.Where(u => u.RoleId == (int)RoleType.Admin))
                .ToListAsync();

            return pendingColleges.Select(c => {
                var admin = c.Users.FirstOrDefault();
                return new PendingApprovalResponse
                {
                    Id = c.Id,
                    Name = c.CollegeName,
                    Email = admin?.Email ?? "",
                    CollegeName = c.CollegeName,
                    CollegeCode = c.CollegeCode,
                    Address = c.Address,
                    State = c.State,
                    ContactEmail = c.ContactEmail,
                    ContactPhone = c.ContactPhone,
                    EstablishedYear = c.EstablishedYear,
                    AdminName = admin?.FullName ?? "",
                    CreatedAt = c.CreatedAt
                };
            }).ToList();
        }

        public async Task<List<PendingApprovalResponse>> GetAllCollegesAsync()
        {
            var colleges = await _context.Colleges
                .Where(c => c.IsApproved && c.IsActive)
                .Include(c => c.Users.Where(u => u.RoleId == (int)RoleType.Admin))
                .ToListAsync();

            return colleges.Select(c => {
                var admin = c.Users.FirstOrDefault();
                return new PendingApprovalResponse
                {
                    Id = c.Id,
                    Name = c.CollegeName,
                    Email = admin?.Email ?? "",
                    CollegeName = c.CollegeName,
                    CollegeCode = c.CollegeCode,
                    Address = c.Address,
                    State = c.State,
                    ContactEmail = c.ContactEmail,
                    ContactPhone = c.ContactPhone,
                    EstablishedYear = c.EstablishedYear,
                    AdminName = admin?.FullName ?? "",
                    CreatedAt = c.CreatedAt
                };
            }).ToList();
        }

        public async Task<List<PendingApprovalResponse>> GetPendingUsersAsync(int adminUserId)
        {
            var admin = await _context.Users.FindAsync(adminUserId);
            if (admin == null || admin.RoleId != (int)RoleType.Admin)
                return new List<PendingApprovalResponse>();

            var pendingUsers = await _context.Users
                .Where(u => !u.IsApproved && u.IsActive && u.CollegeId == admin.CollegeId &&
                            (u.RoleId == (int)RoleType.HOD || u.RoleId == (int)RoleType.Teacher))
                .Include(u => u.Role)
                .ToListAsync();

            return pendingUsers.Select(u => new PendingApprovalResponse
            {
                Id = u.Id,
                Name = u.FullName,
                Email = u.Email,
                Role = u.Role.Name,
                CreatedAt = u.CreatedAt
            }).ToList();
        }

        public async Task<(bool Success, string Message)> ApproveCollegeAsync(ApprovalRequest request)
        {
            var college = await _context.Colleges
                .Include(c => c.Users.Where(u => u.RoleId == (int)RoleType.Admin))
                .FirstOrDefaultAsync(c => c.Id == request.Id);

            if (college == null)
                return (false, "College not found");

            if (request.Approve)
            {
                college.IsApproved = true;

                var admin = college.Users.FirstOrDefault(u => u.RoleId == (int)RoleType.Admin);
                if (admin != null)
                {
                    admin.IsApproved = true;
                }
            }
            else
            {
                college.IsActive = false;

                var admin = college.Users.FirstOrDefault(u => u.RoleId == (int)RoleType.Admin);
                if (admin != null)
                {
                    admin.IsActive = false;
                }
            }

            await _context.SaveChangesAsync();

            return (true, request.Approve ? "College approved successfully" : "College rejected");
        }

        public async Task<(bool Success, string Message)> ApproveUserAsync(ApprovalRequest request)
        {
            var user = await _context.Users.FindAsync(request.Id);

            if (user == null)
                return (false, "User not found");

            if (request.Approve)
            {
                user.IsApproved = true;
            }
            else
            {
                user.IsActive = false;
            }

            await _context.SaveChangesAsync();

            return (true, request.Approve ? "User approved successfully" : "User rejected");
        }

        public async Task<(bool Success, string Message)>
            RegisterPublicUserAsync(PublicUserRegistrationRequest request)
        {
            var college = await _context.Colleges.FindAsync(request.CollegeId);
            if (college == null || !college.IsActive || !college.IsApproved)
                return (false, "College not found or inactive");

            if (request.RoleId is not (int)RoleType.HOD and not (int)RoleType.Teacher)
                return (false, "Invalid role for self-registration");

            if (request.DepartmentId == null)
                return (false, "Department is required");

            if (string.IsNullOrEmpty(request.Designation))
                return (false, "Designation is required");

            if (await _context.Users.AnyAsync(u =>
                u.Email == request.Email && u.CollegeId == request.CollegeId))
                return (false, "Email already registered in this college");

            var verification = await _context.EmailVerifications
                .FirstOrDefaultAsync(v => v.Email == request.Email && v.IsVerified);
            if (verification == null)
                return (false, "Please verify your email address first");

            var user = new User
            {
                CollegeId = request.CollegeId,
                FullName = request.FullName,
                Email = request.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                RoleId = request.RoleId,
                DepartmentId = request.DepartmentId,
                Designation = request.Designation,
                IsActive = true,
                IsApproved = false,
                IsEmailVerified = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            _context.EmailVerifications.Remove(verification);
            await _context.SaveChangesAsync();

            return (true, "Registration successful. Please wait for official approval.");
        }

        public async Task<List<CollegeSummary>> GetActiveCollegesAsync()
        {
            return await _context.Colleges
                .Where(c => c.IsActive && c.IsApproved && c.CollegeCode != "SUPERADMIN")
                .Select(c => new CollegeSummary
                {
                    Id = c.Id,
                    Name = c.CollegeName
                })
                .ToListAsync();
        }

        public async Task<(bool Success, string Message)> VerifyEmailOtpAsync(VerifyOtpRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null) return (false, "User not found");

            if (user.OtpCode != request.Otp || user.OtpExpiry < DateTime.UtcNow)
                return (false, "Invalid or expired OTP");

            user.IsEmailVerified = true;
            user.OtpCode = null;
            user.OtpExpiry = null;
            await _context.SaveChangesAsync();

            return (true, "Email verified successfully");
        }

        public async Task<(bool Success, string Message, LoginResponse? Response)> Verify2FAOtpAsync(VerifyOtpRequest request)
        {
            var user = await _context.Users
                .Include(u => u.College)
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null) return (false, "User not found", null);

            if (user.OtpCode != request.Otp || user.OtpExpiry < DateTime.UtcNow)
                return (false, "Invalid or expired OTP", null);

            user.IsEmailVerified = true;
            user.OtpCode = null;
            user.OtpExpiry = null;
            user.LastLogin = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            var token = GenerateJwtToken(user, user.College, user.Role.Name);

            return (true, "Login successful", new LoginResponse
            {
                Token = token,
                UserId = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role.Name,
                RoleId = user.RoleId,
                CollegeId = user.CollegeId,
                CollegeName = user.College.CollegeName,
                CollegeCode = user.College.CollegeCode,
                DepartmentId = user.DepartmentId
            });
        }

        public async Task<(bool Success, string Message)> SendRegistrationOtpAsync(SendOtpRequest request)
        {

            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
                return (false, "Email already registered");

            var otp = GenerateOtp();
            var verification = await _context.EmailVerifications.FindAsync(request.Email);

            if (verification == null)
            {
                verification = new EmailVerification { Email = request.Email };
                _context.EmailVerifications.Add(verification);
            }

            verification.OtpCode = otp;
            verification.Expiry = DateTime.UtcNow.AddMinutes(10);
            verification.IsVerified = false;
            verification.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            await _emailService.SendEmailAsync(request.Email, "EduVerse - Email Verification OTP",
                $"<h3>Email Verification</h3><p>Your registration OTP is: <strong>{otp}</strong></p><p>Valid for 10 minutes.</p>");

            Console.WriteLine($"[DEBUG] Registration OTP for {request.Email}: {otp}");

            return (true, "OTP sent successfully");
        }

        public async Task<(bool Success, string Message)> VerifyRegistrationOtpAsync(VerifyOtpRequest request)
        {
            var verification = await _context.EmailVerifications.FindAsync(request.Email);
            if (verification == null || verification.OtpCode != request.Otp || verification.Expiry < DateTime.UtcNow)
                return (false, "Invalid or expired OTP");

            verification.IsVerified = true;
            verification.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();


            await _context.SaveChangesAsync();


            return (true, "Email verified successfully");
        }

        private string GenerateOtp()
        {
            return new Random().Next(100000, 999999).ToString();
        }

        private string GenerateJwtToken(User user, College college, string roleName)
        {
            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_config["Jwt:Key"]!)
            );

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim(ClaimTypes.Role, user.RoleId.ToString()),
                new Claim("CollegeId", user.CollegeId.ToString()),
                new Claim("CollegeCode", college.CollegeCode)
            };

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddDays(7),
                signingCredentials: new SigningCredentials(
                    key, SecurityAlgorithms.HmacSha256)
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}

