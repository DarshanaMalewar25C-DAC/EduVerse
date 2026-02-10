using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System.Text.Json.Serialization;

namespace EduVerse.API.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }

        public int CollegeId { get; set; }

        [ForeignKey("CollegeId")]
        [ValidateNever]
        public College College { get; set; } = null!;

        [Required]
        [StringLength(100)]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [StringLength(100)]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        public int RoleId { get; set; }

        [ForeignKey("RoleId")]
        [ValidateNever]
        public Role Role { get; set; } = null!;

        public int? DepartmentId { get; set; }

        [ForeignKey("DepartmentId")]
        public Department? Department { get; set; }

        [StringLength(50)]
        public string? Designation { get; set; }

        public bool IsActive { get; set; } = true;

        public bool IsApproved { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? LastLogin { get; set; }

        public string? PasswordResetToken { get; set; }

        public DateTime? PasswordResetTokenExpiry { get; set; }

        public string? OtpCode { get; set; }

        public DateTime? OtpExpiry { get; set; }

        public bool IsEmailVerified { get; set; } = false;

        [JsonIgnore]
        public ICollection<Timetable> GeneratedTimetables { get; set; } = new List<Timetable>();
        [JsonIgnore]
        public ICollection<Timetable> ApprovedTimetables { get; set; } = new List<Timetable>();
        [JsonIgnore]
        public ICollection<TimetableEntry> TimetableEntries { get; set; } = new List<TimetableEntry>();

    }
}

