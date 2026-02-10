using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System.Text.Json.Serialization;
namespace EduVerse.API.Models
{
    public class Subject
    {
        [Key]
        public int Id { get; set; }

        public int CollegeId { get; set; }

        [ForeignKey("CollegeId")]
        [ValidateNever]
        public College College { get; set; } = null!;

        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [StringLength(20)]
        public string Code { get; set; } = string.Empty;

        public int DepartmentId { get; set; }

        [ForeignKey("DepartmentId")]
        [ValidateNever]
        public Department Department { get; set; } = null!;

        [Range(1, 10)]
        public int Credits { get; set; }
        
        [Range(1, 5)]
        public int Year { get; set; } = 1;

        [Range(30, 180)]
        public int DurationMinutes { get; set; } = 60;

        [Range(1, 10)]
        public int ClassesPerWeek { get; set; } = 5;

        public int? TeacherId { get; set; }

        [ForeignKey("TeacherId")]
        [ValidateNever]
        public User? Teacher { get; set; }


        [JsonIgnore]
        public ICollection<TimetableEntry> TimetableEntries { get; set; } = new List<TimetableEntry>();
    }
}
