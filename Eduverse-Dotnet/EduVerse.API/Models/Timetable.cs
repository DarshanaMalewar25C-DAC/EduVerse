using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System.Text.Json.Serialization;

namespace EduVerse.API.Models
{
    public class Timetable
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

        public int SemesterId { get; set; }

        [ForeignKey("SemesterId")]
        [ValidateNever]
        public Semester Semester { get; set; } = null!;
        public int Year { get; set; } = 1;

        public DateTime GeneratedDate { get; set; } = DateTime.UtcNow;

        public int GeneratedByUserId { get; set; }

        [ForeignKey("GeneratedByUserId")]
        [ValidateNever]
        public User GeneratedBy { get; set; } = null!;

        [StringLength(20)]
        public string Status { get; set; } = "Draft";

        public int? ApprovedByUserId { get; set; }

        [ForeignKey("ApprovedByUserId")]
        public User? ApprovedBy { get; set; }

        public DateTime? ApprovedDate { get; set; }

        [StringLength(500)]
        public string? Comments { get; set; }

        public double? OptimizationScore { get; set; }

        public bool IsActive { get; set; } = false;

        [JsonIgnore]
        public ICollection<TimetableEntry> Entries { get; set; } = new List<TimetableEntry>();
    }
}

