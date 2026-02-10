using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;

namespace EduVerse.API.Models
{
    public class TimetableEntry
    {
        [Key]
        public int Id { get; set; }

        public int TimetableId { get; set; }

        [ForeignKey("TimetableId")]
        [ValidateNever]
        public Timetable Timetable { get; set; } = null!;

        public int SubjectId { get; set; }

        [ForeignKey("SubjectId")]
        [ValidateNever]
        public Subject Subject { get; set; } = null!;

        public int TeacherId { get; set; }

        [ForeignKey("TeacherId")]
        [ValidateNever]
        public User Teacher { get; set; } = null!;

        public int ClassroomId { get; set; }

        [ForeignKey("ClassroomId")]
        [ValidateNever]
        public Classroom Classroom { get; set; } = null!;

        public int TimeSlotId { get; set; }

        [ForeignKey("TimeSlotId")]
        [ValidateNever]
        public TimeSlot TimeSlot { get; set; } = null!;

        [Range(1, 6)]
        public int PeriodNumber { get; set; }

        [Required]
        [StringLength(20)]
        public string DayOfWeek { get; set; } = string.Empty;

        [StringLength(100)]
        public string? Notes { get; set; }
    }
}

