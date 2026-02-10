using EduVerse.API.Models;

namespace EduVerse.API.Services
{
    public class TimetableValidationService
    {
        public class ValidationResult
        {
            public bool IsValid { get; set; }
            public List<string> Errors { get; set; } = new List<string>();
            public List<string> Warnings { get; set; } = new List<string>();
        }

        public ValidationResult ValidateTimetableGeneration(
            List<Subject> subjects,
            List<User> teachers,
            List<Classroom> classrooms,
            TimeSlot shift)
        {
            var result = new ValidationResult { IsValid = true };

            if (subjects.Count < 4)
            {
                result.IsValid = false;
                result.Errors.Add("Minimum 4 subjects are required for timetable generation.");
            }

            if (subjects.Count > 8)
            {
                result.IsValid = false;
                result.Errors.Add("Maximum 8 subjects allowed for timetable generation.");
            }

            var totalShiftMinutes = (shift.EndTime - shift.StartTime).TotalMinutes;
            if (totalShiftMinutes < 180)
            {
                result.IsValid = false;
                result.Errors.Add("Shift duration must be at least 3 hours (180 minutes).");
            }

            if (totalShiftMinutes > 480)
            {
                result.IsValid = false;
                result.Errors.Add("Shift duration cannot exceed 8 hours (480 minutes).");
            }

            var periodsBeforeBreak = shift.BreakAfterPeriod;
            var totalPeriodsWithBreaks = 0;
            var remainingMinutes = totalShiftMinutes;

            while (remainingMinutes > 0)
            {
                var periodBlock = Math.Min(periodsBeforeBreak, (int)(remainingMinutes / shift.PeriodDurationMinutes));
                totalPeriodsWithBreaks += periodBlock;
                remainingMinutes -= periodBlock * shift.PeriodDurationMinutes;

                if (remainingMinutes > shift.BreakDurationMinutes)
                {
                    remainingMinutes -= shift.BreakDurationMinutes;
                }
                else
                {
                    break;
                }
            }

            if (shift.TotalPeriods != totalPeriodsWithBreaks)
            {
                result.Warnings.Add($"TimeSlot TotalPeriods ({shift.TotalPeriods}) should be {totalPeriodsWithBreaks} based on shift duration and break configuration.");
            }

            var totalClassesNeeded = subjects.Sum(s => s.ClassesPerWeek);
            var totalSlotsAvailable = shift.TotalPeriods * 6;

            if (totalClassesNeeded > totalSlotsAvailable)
            {
                result.IsValid = false;
                result.Errors.Add($"Not enough time slots available. Need {totalClassesNeeded} slots but only {totalSlotsAvailable} available (6 days × {shift.TotalPeriods} periods).");
            }

            var teacherSubjectCount = subjects
                .Where(s => s.TeacherId.HasValue)
                .GroupBy(s => s.TeacherId)
                .Select(g => new { TeacherId = g.Key, SubjectCount = g.Count() })
                .ToList();

            foreach (var ts in teacherSubjectCount)
            {
                if (ts.SubjectCount > 2)
                {
                    result.IsValid = false;
                    var teacher = teachers.FirstOrDefault(t => t.Id == ts.TeacherId);
                    result.Errors.Add($"Teacher '{teacher?.FullName ?? "Unknown"}' is assigned to {ts.SubjectCount} subjects. Maximum allowed is 2 subjects per teacher.");
                }
            }

            var subjectsWithoutTeachers = subjects.Where(s => !s.TeacherId.HasValue).ToList();
            if (subjectsWithoutTeachers.Any())
            {
                result.Warnings.Add($"{subjectsWithoutTeachers.Count} subject(s) don't have assigned teachers. Random department teachers will be assigned.");
            }

            var uniqueTeachersNeeded = subjects.Where(s => s.TeacherId.HasValue).Select(s => s.TeacherId).Distinct().Count();
            if (uniqueTeachersNeeded < 2)
            {
                result.IsValid = false;
                result.Errors.Add("At least 2 unique teachers must be assigned to subjects.");
            }

            if (classrooms.Count < 2)
            {
                result.IsValid = false;
                result.Errors.Add("At least 2 classrooms are required for timetable generation.");
            }

            var maxConcurrentClasses = subjects.Count;
            if (classrooms.Count < maxConcurrentClasses)
            {
                result.Warnings.Add($"Only {classrooms.Count} classrooms available for {subjects.Count} subjects. This may cause scheduling conflicts.");
            }

            var departmentIds = subjects.Select(s => s.DepartmentId).Distinct().ToList();
            if (departmentIds.Count > 1)
            {
                result.Warnings.Add("Subjects from multiple departments detected. Ensure teachers are from the correct departments.");
            }

            foreach (var subject in subjects)
            {
                if (subject.ClassesPerWeek < 1 || subject.ClassesPerWeek > 10)
                {
                    result.IsValid = false;
                    result.Errors.Add($"Subject '{subject.Name}' has invalid ClassesPerWeek ({subject.ClassesPerWeek}). Must be between 1 and 10.");
                }
            }

            var teachersInDept = teachers.Where(t => departmentIds.Contains(t.DepartmentId ?? 0)).ToList();
            if (teachersInDept.Count < 2)
            {
                result.IsValid = false;
                result.Errors.Add($"Not enough teachers in the department. Found {teachersInDept.Count}, need at least 2.");
            }

            return result;
        }

        public int CalculateTotalPeriods(TimeSlot shift)
        {
            var totalShiftMinutes = (shift.EndTime - shift.StartTime).TotalMinutes;
            var periodsBeforeBreak = shift.BreakAfterPeriod;
            var totalPeriods = 0;
            var remainingMinutes = totalShiftMinutes;

            while (remainingMinutes > 0)
            {
                var periodBlock = Math.Min(periodsBeforeBreak, (int)(remainingMinutes / shift.PeriodDurationMinutes));
                totalPeriods += periodBlock;
                remainingMinutes -= periodBlock * shift.PeriodDurationMinutes;

                if (remainingMinutes > shift.BreakDurationMinutes)
                {
                    remainingMinutes -= shift.BreakDurationMinutes;
                }
                else
                {
                    break;
                }
            }

            return totalPeriods;
        }

        public List<(int PeriodNumber, TimeSpan StartTime, TimeSpan EndTime, bool IsBreak)> GeneratePeriodTimings(TimeSlot shift)
        {
            var timings = new List<(int, TimeSpan, TimeSpan, bool)>();
            var currentTime = shift.StartTime;
            int periodNumber = 1;
            int periodsUntilBreak = shift.BreakAfterPeriod;

            while (currentTime < shift.EndTime)
            {
                if (periodsUntilBreak == 0)
                {
                    var breakEnd = currentTime.Add(TimeSpan.FromMinutes(shift.BreakDurationMinutes));
                    if (breakEnd > shift.EndTime) break;
                    
                    timings.Add((0, currentTime, breakEnd, true));
                    currentTime = breakEnd;
                    periodsUntilBreak = shift.BreakAfterPeriod;
                    continue;
                }

                var periodEnd = currentTime.Add(TimeSpan.FromMinutes(shift.PeriodDurationMinutes));
                if (periodEnd > shift.EndTime) break;

                timings.Add((periodNumber, currentTime, periodEnd, false));
                currentTime = periodEnd;
                periodNumber++;
                periodsUntilBreak--;
            }

            return timings;
        }
    }
}
