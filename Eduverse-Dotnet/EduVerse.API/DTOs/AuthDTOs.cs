using System.ComponentModel.DataAnnotations;

namespace EduVerse.API.DTOs
{
    public class CollegeRegistrationRequest
    {
        [Required]
        [StringLength(200, MinimumLength = 3)]
        [RegularExpression(@"^[A-Za-z0-9\s.,&-]+$", ErrorMessage = "College Name contains invalid characters")]
        public string CollegeName { get; set; } = string.Empty;

        [Required]
        [StringLength(20, MinimumLength = 2)]
        [RegularExpression(@"^[A-Z0-9]+$", ErrorMessage = "College Code must be alphanumeric uppercase")]
        public string CollegeCode { get; set; } = string.Empty;

        [Required]
        [StringLength(500, MinimumLength = 10)]
        public string Address { get; set; } = string.Empty;

        [Required]
        [StringLength(100, MinimumLength = 2)]
        public string State { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [StringLength(100)]
        public string ContactEmail { get; set; } = string.Empty;

        [Required]
        [StringLength(20)]
        [RegularExpression(@"^\d{10}$", ErrorMessage = "Phone number must be 10 digits")]
        public string ContactPhone { get; set; } = string.Empty;

        [Required]
        [Range(1800, 2100, ErrorMessage = "Established year must be between 1800 and 2100")]
        public int EstablishedYear { get; set; }

        [Required]
        [StringLength(100, MinimumLength = 2)]
        [RegularExpression(@"^[A-Za-z\s.]+$", ErrorMessage = "Admin Name contains invalid characters")]
        public string AdminName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [StringLength(100)]
        public string AdminEmail { get; set; } = string.Empty;

        [Required]
        [StringLength(100, MinimumLength = 8)]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$", ErrorMessage = "Password must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character")]
        public string AdminPassword { get; set; } = string.Empty;
    }

    public class LoginRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;
    }

    public class LoginResponse
    {
        public string Token { get; set; } = string.Empty;
        public int UserId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public int RoleId { get; set; }
        public int CollegeId { get; set; }
        public string CollegeName { get; set; } = string.Empty;
        public string CollegeCode { get; set; } = string.Empty;
        public int? DepartmentId { get; set; }
        public bool Requires2FA { get; set; }
    }

    public class VerifyOtpRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Otp { get; set; } = string.Empty;
    }

    public class UserRegistrationRequest
    {
        [Required]
        [StringLength(100, MinimumLength = 2)]
        [RegularExpression(@"^[A-Za-z\s.]+$", ErrorMessage = "Full Name contains invalid characters")]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [StringLength(100)]
        [RegularExpression(@"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$", ErrorMessage = "Invalid Email Format")]
        public string Email { get; set; } = string.Empty;

        [Required]
        [StringLength(100, MinimumLength = 8)]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$", ErrorMessage = "Password must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character")]
        public string Password { get; set; } = string.Empty;

        [Required]
        [Range(1, 3)]
        public int RoleId { get; set; }

        public int? DepartmentId { get; set; }

        public List<int>? SubjectIds { get; set; }

        [Required]
        [StringLength(50, MinimumLength = 2)]
        [RegularExpression(@"^[A-Za-z\s.,-]+$", ErrorMessage = "Designation contains invalid characters")]
        public string Designation { get; set; } = string.Empty;

    }

    public class PublicUserRegistrationRequest : UserRegistrationRequest
    {
        [Required]
        public int CollegeId { get; set; }
    }

    public class CollegeSummary
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }

    public class ForgotPasswordRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
    }

    public class SendOtpRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
    }

    public class ResetPasswordRequest
    {
        [Required]
        public string Token { get; set; } = string.Empty;

        [Required]
        [StringLength(100, MinimumLength = 8)]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$", ErrorMessage = "Password must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character")]
        public string NewPassword { get; set; } = string.Empty;
    }

    public class ApprovalRequest
    {
        [Required]
        public int Id { get; set; }

        [Required]
        public bool Approve { get; set; }

        public string? Reason { get; set; }
    }

    public class PendingApprovalResponse
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? CollegeName { get; set; }
        public string? CollegeCode { get; set; }
        public string? Address { get; set; }
        public string? State { get; set; }
        public string? ContactEmail { get; set; }
        public string? ContactPhone { get; set; }
        public int? EstablishedYear { get; set; }
        public string? AdminName { get; set; }
        public string? Role { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}

