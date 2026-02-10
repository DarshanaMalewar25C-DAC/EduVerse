namespace EduVerse.API.DTOs
{
    public class TimetableGenerationRequest
    {
        public int SemesterId { get; set; }
        public int DepartmentId { get; set; }
        public int Year { get; set; } = 1;
        public List<int> SubjectIds { get; set; } = new();
        public int MaxClassesPerDay { get; set; } = 6;
        public bool IncludeWeekends { get; set; } = false;
        public int NumberOfSolutions { get; set; } = 3;
    }

    public class TimetableGenerationResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public List<TimetableDto> GeneratedTimetables { get; set; } = new();
    }

    public class TimetableDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string SemesterName { get; set; } = string.Empty;
        public int Year { get; set; }
        public int BreakAfterPeriod { get; set; }
        public DateTime GeneratedDate { get; set; }
        public string GeneratedBy { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public double? OptimizationScore { get; set; }
        public List<TimetableEntryDto> Entries { get; set; } = new();
    }

    public class TimetableEntryDto
    {
        public int Id { get; set; }
        public string SubjectName { get; set; } = string.Empty;
        public string SubjectCode { get; set; } = string.Empty;
        public string FacultyName { get; set; } = string.Empty;
        public string ClassroomName { get; set; } = string.Empty;
        public string DayOfWeek { get; set; } = string.Empty;
        public int PeriodNumber { get; set; }
        public string TimeSlot { get; set; } = string.Empty;
        public string StartTime { get; set; } = string.Empty;
        public string EndTime { get; set; } = string.Empty;
    }

    public class TimetableApprovalRequest
    {
        public int TimetableId { get; set; }
        public bool Approve { get; set; }
        public string? Comments { get; set; }
    }
}

