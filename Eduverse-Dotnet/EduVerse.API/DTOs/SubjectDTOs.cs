using System.ComponentModel.DataAnnotations;

namespace EduVerse.API.DTOs
{
    public class SubjectDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public int DepartmentId { get; set; }
        public string? DepartmentName { get; set; }
        public int Credits { get; set; }
        public int ClassesPerWeek { get; set; }
        public int Year { get; set; }
        public int DurationMinutes { get; set; }

        public int? TeacherId { get; set; }
        public string? TeacherName { get; set; }
    }

    public class CreateSubjectDto
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [StringLength(20)]
        [RegularExpression(@"^[A-Z0-9\-]+$", ErrorMessage = "Code must be alphanumeric (hyphens allowed)")]
        public string Code { get; set; } = string.Empty;

        public int DepartmentId { get; set; }

        [Range(1, 10)]
        public int Credits { get; set; }

        [Range(1, 10)]
        public int ClassesPerWeek { get; set; } = 5;

        [Range(1, 5)]
        public int Year { get; set; } = 1;

        [Range(30, 180)]
        public int DurationMinutes { get; set; } = 60;

        public int? TeacherId { get; set; }
    }

    public class UpdateSubjectDto
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [StringLength(20)]
        public string Code { get; set; } = string.Empty;

        public int DepartmentId { get; set; }

        [Range(1, 10)]
        public int Credits { get; set; }

        [Range(1, 10)]
        public int ClassesPerWeek { get; set; }

        [Range(1, 5)]
        public int Year { get; set; }

        [Range(30, 180)]
        public int DurationMinutes { get; set; }

        public int? TeacherId { get; set; }
    }
}
