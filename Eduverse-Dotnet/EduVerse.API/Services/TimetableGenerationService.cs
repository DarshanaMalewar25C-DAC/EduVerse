using EduVerse.API.Data;
using EduVerse.API.DTOs;
using EduVerse.API.Models;
using Microsoft.EntityFrameworkCore;

namespace EduVerse.API.Services
{
    public class TimetableGenerationService
    {
        private readonly ApplicationDbContext _context;
        private readonly TimetableValidationService _validationService;

        public TimetableGenerationService(ApplicationDbContext context)
        {
            _context = context;
            _validationService = new TimetableValidationService();
        }

        public async Task<TimetableGenerationResponse> GenerateTimetablesAsync(
            TimetableGenerationRequest request, int userId)
        {
            try
            {
                var semester = await _context.Semesters.FindAsync(request.SemesterId);
                var department = await _context.Departments.FindAsync(request.DepartmentId);

                if (semester == null || department == null)
                    return new TimetableGenerationResponse { Success = false, Message = "Semester or Department not found" };

                var subjects = await _context.Subjects
                    .Where(s => s.DepartmentId == department.Id && s.Year == request.Year)
                    .ToListAsync();

                var allTeachers = await _context.Users
                    .Where(u => u.RoleId == 3 && u.IsActive && u.CollegeId == department.CollegeId)
                    .ToListAsync();
                    
                var allClassrooms = await _context.Classrooms
                    .Where(c => c.CollegeId == department.CollegeId)
                    .ToListAsync();

                var shift = await _context.TimeSlots
                    .FirstOrDefaultAsync(ts => ts.CollegeId == department.CollegeId && ts.Year == request.Year);
                    
                if (shift == null)
                    return new TimetableGenerationResponse { Success = false, Message = $"No TimeSlot Shift defined for Year {request.Year}" };

                // Ensure TotalPeriods is calculated even if DB has it as 0
                if (shift.TotalPeriods == 0)
                {
                    shift.TotalPeriods = _validationService.CalculateTotalPeriods(shift);
                }

                var validationResult = _validationService.ValidateTimetableGeneration(
                    subjects, allTeachers, allClassrooms, shift);

                if (!validationResult.IsValid)
                {
                    var errorMessage = "Timetable generation not possible:\n" + string.Join("\n", validationResult.Errors);
                    if (validationResult.Warnings.Any())
                    {
                        errorMessage += "\n\nWarnings:\n" + string.Join("\n", validationResult.Warnings);
                    }
                    return new TimetableGenerationResponse { Success = false, Message = errorMessage };
                }

                // Get existing entries for the entire college/department to check collisions
                var existingEntries = await _context.TimetableEntries
                    .Include(e => e.Timetable)
                    .Where(e => e.Timetable.IsActive && e.Timetable.CollegeId == department.CollegeId)
                    .ToListAsync();

                var generatedTimetables = new List<TimetableDto>();

                for (int i = 0; i < request.NumberOfSolutions; i++)
                {
                    var timetable = await GenerateSingleTimetableAsync(
                        semester, department, subjects, allTeachers, allClassrooms,
                        shift, existingEntries, userId, i + 1, request.Year);

                    if (timetable != null) generatedTimetables.Add(timetable);
                }

                var responseMessage = $"Generated {generatedTimetables.Count} solution(s) for {department.Name} (Year {request.Year})";
                if (validationResult.Warnings.Any())
                {
                    responseMessage += "\n\nWarnings:\n" + string.Join("\n", validationResult.Warnings);
                }

                return new TimetableGenerationResponse
                {
                    Success = true,
                    Message = responseMessage,
                    GeneratedTimetables = generatedTimetables
                };
            }
            catch (Exception ex)
            {
                return new TimetableGenerationResponse { Success = false, Message = $"Error: {ex.Message}" };
            }
        }

        private async Task<TimetableDto?> GenerateSingleTimetableAsync(
            Semester semester, Department department, List<Subject> subjects,
            List<User> teachers, List<Classroom> classrooms, TimeSlot shift,
            List<TimetableEntry> existingEntries, int userId, int solutionNumber, int year)
        {
            var timetable = new Timetable
            {
                Name = $"{department.Code} - Year {year} - {semester.Name} (Sol {solutionNumber})",
                SemesterId = semester.Id,
                CollegeId = semester.CollegeId,
                Year = year,
                GeneratedByUserId = userId,
                GeneratedDate = DateTime.UtcNow,
                Status = "Draft"
            };

            _context.Timetables.Add(timetable);
            await _context.SaveChangesAsync();

            var ga = new Algorithms.GeneticAlgorithm(subjects, teachers, classrooms, shift, existingEntries);
            var bestChromosome = await ga.RunAsync();

            var entries = bestChromosome.Genes.Select(g => new TimetableEntry
            {
                TimetableId = timetable.Id,
                SubjectId = g.SubjectId,
                TeacherId = g.TeacherId,
                ClassroomId = g.ClassroomId,
                TimeSlotId = shift.Id,
                PeriodNumber = g.PeriodNumber,
                DayOfWeek = g.DayOfWeek
            }).ToList();

            _context.TimetableEntries.AddRange(entries);
            await _context.SaveChangesAsync();

            timetable.OptimizationScore = bestChromosome.Fitness;
            await _context.SaveChangesAsync();

            return await GetTimetableDtoAsync(timetable.Id);
        }

        public async Task<TimetableDto?> GetTimetableDtoAsync(int timetableId)
        {
            var timetable = await _context.Timetables
                .Include(t => t.Semester)
                .Include(t => t.GeneratedBy)
                .Include(t => t.Entries).ThenInclude(e => e.Subject)
                .Include(t => t.Entries).ThenInclude(e => e.Teacher)
                .Include(t => t.Entries).ThenInclude(e => e.Classroom)
                .Include(t => t.Entries).ThenInclude(e => e.TimeSlot)
                .FirstOrDefaultAsync(t => t.Id == timetableId);

            if (timetable == null) return null;

            return new TimetableDto
            {
                Id = timetable.Id,
                Name = timetable.Name,
                SemesterName = timetable.Semester.Name,
                Year = timetable.Year,
                BreakAfterPeriod = timetable.Entries.FirstOrDefault()?.TimeSlot.BreakAfterPeriod ?? 0,
                GeneratedDate = timetable.GeneratedDate,
                GeneratedBy = timetable.GeneratedBy.FullName,
                Status = timetable.Status,
                OptimizationScore = timetable.OptimizationScore,
                Entries = timetable.Entries.Select(e =>
                {
                    var timings = CalculatePeriodTime(e.TimeSlot, e.PeriodNumber);
                    return new TimetableEntryDto
                    {
                        Id = e.Id,
                        SubjectName = e.Subject.Name,
                        SubjectCode = e.Subject.Code,
                        FacultyName = e.Teacher.FullName,
                        ClassroomName = $"{e.Classroom.RoomNumber} ({e.Classroom.Building})",
                        DayOfWeek = e.DayOfWeek,
                        PeriodNumber = e.PeriodNumber,
                        TimeSlot = $"{timings.StartTime} - {timings.EndTime}",
                        StartTime = timings.StartTime,
                        EndTime = timings.EndTime
                    };
                }).OrderBy(e => e.DayOfWeek).ThenBy(e => e.PeriodNumber).ToList()
            };
        }

        private (string StartTime, string EndTime) CalculatePeriodTime(TimeSlot shift, int periodNumber)
        {
            var currentTime = shift.StartTime;
            
            for (int p = 1; p < periodNumber; p++)
            {
                currentTime = currentTime.Add(TimeSpan.FromMinutes(shift.PeriodDurationMinutes));
                if (p % shift.BreakAfterPeriod == 0)
                {
                    currentTime = currentTime.Add(TimeSpan.FromMinutes(shift.BreakDurationMinutes));
                }
            }

            var endTime = currentTime.Add(TimeSpan.FromMinutes(shift.PeriodDurationMinutes));
            return (currentTime.ToString(@"hh\:mm"), endTime.ToString(@"hh\:mm"));
        }

        public async Task<bool> ApproveTimetableAsync(TimetableApprovalRequest request, int userId)
        {
            var timetable = await _context.Timetables.FindAsync(request.TimetableId);
            if (timetable == null) return false;

            timetable.Status = request.Approve ? "Approved" : "Rejected";
            timetable.ApprovedByUserId = userId;
            timetable.ApprovedDate = DateTime.UtcNow;
            timetable.Comments = request.Comments;

            if (request.Approve)
            {
                timetable.IsActive = true;
            }

            await _context.SaveChangesAsync();
            return true;
        }
    }
}

