using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;

namespace EduVerse.API.Models
{
    public class TimeSlot
    {
        [Key]
        public int Id { get; set; }

        public int CollegeId { get; set; }

        [ForeignKey("CollegeId")]
        [ValidateNever]
        public College College { get; set; } = null!;

        [Required]
        [StringLength(20)]
        public string Shift { get; set; } = "Morning";

        [Required]
        public TimeSpan StartTime { get; set; }

        [Required]
        public TimeSpan EndTime { get; set; }

        [Range(30, 120)]
        public int PeriodDurationMinutes { get; set; } = 60;
        
        [Range(1, 5)]
        public int Year { get; set; } = 1;

        [Range(5, 60)]
        public int BreakDurationMinutes { get; set; } = 15;

        [Range(1, 10)]
        public int BreakAfterPeriod { get; set; } = 3;

        public int TotalPeriods { get; set; }


        public ICollection<TimetableEntry> TimetableEntries { get; set; } = new List<TimetableEntry>();
    }
}

