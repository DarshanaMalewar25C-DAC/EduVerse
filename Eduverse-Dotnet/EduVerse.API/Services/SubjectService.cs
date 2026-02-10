using Microsoft.EntityFrameworkCore;
using EduVerse.API.Data;
using EduVerse.API.DTOs;
using EduVerse.API.Models;
using EduVerse.API.Enums;

namespace EduVerse.API.Services
{
    public class SubjectService
    {
        private readonly ApplicationDbContext _context;

        public SubjectService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<SubjectDto>> GetAllAsync(int collegeId)
        {
            return await _context.Subjects
                .AsNoTracking()
                .Include(s => s.Department)
                .Include(s => s.Teacher)
                .Where(s => s.CollegeId == collegeId)
                .Select(s => new SubjectDto
                {
                    Id = s.Id,
                    Name = s.Name,
                    Code = s.Code,
                    DepartmentId = s.DepartmentId,
                    DepartmentName = s.Department != null ? s.Department.Name : "N/A",
                    Credits = s.Credits,
                    ClassesPerWeek = s.ClassesPerWeek,
                    Year = s.Year,
                    DurationMinutes = s.DurationMinutes,

                    TeacherId = s.TeacherId,
                    TeacherName = s.Teacher != null ? s.Teacher.FullName : null
                })
                .ToListAsync();
        }

        public async Task<SubjectDto?> GetByIdAsync(int id, int collegeId)
        {
            var subject = await _context.Subjects
                .AsNoTracking()
                .Include(s => s.Department)
                .Include(s => s.Teacher)
                .FirstOrDefaultAsync(s => s.Id == id && s.CollegeId == collegeId);

            if (subject == null)
                return null;

            return new SubjectDto
            {
                Id = subject.Id,
                Name = subject.Name,
                Code = subject.Code,
                DepartmentId = subject.DepartmentId,
                DepartmentName = subject.Department != null ? subject.Department.Name : "N/A",
                Credits = subject.Credits,
                ClassesPerWeek = subject.ClassesPerWeek,
                Year = subject.Year,
                DurationMinutes = subject.DurationMinutes,

                TeacherId = subject.TeacherId,
                TeacherName = subject.Teacher != null ? subject.Teacher.FullName : null
            };
        }

        public async Task<SubjectDto> CreateAsync(CreateSubjectDto dto, int collegeId)
        {
            bool exists = await _context.Subjects.AnyAsync(s =>
                s.Code == dto.Code &&
                s.CollegeId == collegeId);

            if (exists)
                throw new InvalidOperationException("Subject code already exists in this college.");

            if (dto.TeacherId.HasValue)
            {
                var teacher = await _context.Users
                    .AsNoTracking()
                    .FirstOrDefaultAsync(u =>
                        u.Id == dto.TeacherId &&
                        u.CollegeId == collegeId &&
                        u.RoleId == (int)RoleType.Teacher &&
                        u.IsActive);

                if (teacher == null)
                    throw new InvalidOperationException("Invalid teacher assignment.");

                if (teacher.DepartmentId != dto.DepartmentId)
                    throw new InvalidOperationException("Assigned teacher does not belong to the selected department.");
            }

            if (dto.TeacherId.HasValue)
            {
                bool teacherAlreadyAssigned = await _context.Subjects.AnyAsync(s =>
                    s.TeacherId == dto.TeacherId &&
                    s.CollegeId == collegeId);

                if (teacherAlreadyAssigned)
                    throw new InvalidOperationException("This teacher is already assigned to another subject.");
            }
            var subject = new Subject
            {
                CollegeId = collegeId,
                Name = dto.Name,
                Code = dto.Code,
                DepartmentId = dto.DepartmentId,
                Credits = dto.Credits,
                ClassesPerWeek = dto.ClassesPerWeek,
                Year = dto.Year,
                DurationMinutes = dto.DurationMinutes,

                TeacherId = dto.TeacherId
            };

            _context.Subjects.Add(subject);
            await _context.SaveChangesAsync();

            var created = await _context.Subjects
                .AsNoTracking()
                .Include(s => s.Department)
                .Include(s => s.Teacher)
                .FirstAsync(s => s.Id == subject.Id);

            return new SubjectDto
            {
                Id = created.Id,
                Name = created.Name,
                Code = created.Code,
                DepartmentId = created.DepartmentId,
                DepartmentName = created.Department?.Name ?? "N/A",
                Credits = created.Credits,
                ClassesPerWeek = created.ClassesPerWeek,
                Year = created.Year,
                DurationMinutes = created.DurationMinutes,

                TeacherId = created.TeacherId,
                TeacherName = created.Teacher?.FullName
            };
        }

        public async Task<bool> UpdateAsync(int id, UpdateSubjectDto dto, int collegeId)
        {
            var subject = await _context.Subjects
                .FirstOrDefaultAsync(s => s.Id == id && s.CollegeId == collegeId);

            if (subject == null)
                return false;

            if (dto.TeacherId.HasValue)
            {
                var teacher = await _context.Users
                    .AsNoTracking()
                    .FirstOrDefaultAsync(u =>
                        u.Id == dto.TeacherId &&
                        u.CollegeId == collegeId &&
                        u.RoleId == (int)RoleType.Teacher &&
                        u.IsActive);

                if (teacher == null)
                    throw new InvalidOperationException("Invalid teacher assignment.");

                if (teacher.DepartmentId != dto.DepartmentId)
                    throw new InvalidOperationException("Assigned teacher does not belong to the selected department.");
            }

            if (dto.TeacherId.HasValue)
            {
                bool teacherAlreadyAssigned = await _context.Subjects.AnyAsync(s =>
                    s.TeacherId == dto.TeacherId &&
                    s.Id != id &&
                    s.CollegeId == collegeId);

                if (teacherAlreadyAssigned)
                    throw new InvalidOperationException("This teacher is already assigned to another subject.");
            }

            subject.Name = dto.Name;
            subject.Code = dto.Code;
            subject.DepartmentId = dto.DepartmentId;
            subject.Credits = dto.Credits;
            subject.ClassesPerWeek = dto.ClassesPerWeek;
            subject.Year = dto.Year;
            subject.DurationMinutes = dto.DurationMinutes;

            subject.TeacherId = dto.TeacherId;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id, int collegeId)
        {
            var subject = await _context.Subjects
                .FirstOrDefaultAsync(s => s.Id == id && s.CollegeId == collegeId);

            if (subject == null)
                return false;

            _context.Subjects.Remove(subject);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
