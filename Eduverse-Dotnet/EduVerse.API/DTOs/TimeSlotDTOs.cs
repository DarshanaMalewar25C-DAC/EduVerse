using System.ComponentModel.DataAnnotations;

namespace EduVerse.API.DTOs
{
    public class TimeSlotDto
    {
        public int Id { get; set; }
        public string Shift { get; set; } = string.Empty;
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public int PeriodDurationMinutes { get; set; }
        public int BreakDurationMinutes { get; set; }
        public int BreakAfterPeriod { get; set; }
        public int Year { get; set; }

    }

    public class CreateTimeSlotDto
    {
        [Required]
        [StringLength(20)]
        public string Shift { get; set; } = "Morning";

        [Required]
        public TimeSpan StartTime { get; set; }

        [Required]
        public TimeSpan EndTime { get; set; }

        public int PeriodDurationMinutes { get; set; } = 60;
        public int BreakDurationMinutes { get; set; } = 15;
        public int BreakAfterPeriod { get; set; } = 3;
        public int Year { get; set; } = 1;
    }

    public class UpdateTimeSlotDto
    {
        [Required]
        [StringLength(20)]
        public string Shift { get; set; } = "Morning";

        [Required]
        public TimeSpan StartTime { get; set; }

        [Required]
        public TimeSpan EndTime { get; set; }

        public int PeriodDurationMinutes { get; set; }
        public int BreakDurationMinutes { get; set; }
        public int BreakAfterPeriod { get; set; }
        public int Year { get; set; }


    }
}

