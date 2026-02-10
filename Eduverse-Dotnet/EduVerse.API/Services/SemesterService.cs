using Microsoft.EntityFrameworkCore;
using EduVerse.API.Data;
using EduVerse.API.DTOs;
using EduVerse.API.Models;

namespace EduVerse.API.Services
{
    public class SemesterService
    {
        private readonly ApplicationDbContext _context;

        public SemesterService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<SemesterDto>> GetAllAsync(int collegeId)
        {
            return await _context.Semesters
                .AsNoTracking()
                .Where(s => s.CollegeId == collegeId)
                .Select(s => new SemesterDto
                {
                    Id = s.Id,
                    Name = s.Name,
                    Code = s.Code,
                    StartDate = s.StartDate,
                    EndDate = s.EndDate
                })
                .ToListAsync();
        }

        public async Task<SemesterDto?> GetByIdAsync(int id, int collegeId)
        {
            var s = await _context.Semesters
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.Id == id && s.CollegeId == collegeId);

            return s == null ? null : new SemesterDto
            {
                Id = s.Id,
                Name = s.Name,
                Code = s.Code,
                StartDate = s.StartDate,
                EndDate = s.EndDate
            };
        }

        public async Task<SemesterDto> CreateAsync(CreateSemesterDto dto, int collegeId)
        {
            var semester = new Semester
            {
                CollegeId = collegeId,
                Name = dto.Name,
                Code = dto.Code,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate
            };

            _context.Semesters.Add(semester);
            await _context.SaveChangesAsync();

            return new SemesterDto
            {
                Id = semester.Id,
                Name = semester.Name,
                Code = semester.Code,
                StartDate = semester.StartDate,
                EndDate = semester.EndDate
            };
        }

        public async Task<bool> UpdateAsync(int id, UpdateSemesterDto dto, int collegeId)
        {
            var semester = await _context.Semesters
                .FirstOrDefaultAsync(s => s.Id == id && s.CollegeId == collegeId);

            if (semester == null) return false;

            semester.Name = dto.Name;
            semester.Code = dto.Code;
            semester.StartDate = dto.StartDate;
            semester.EndDate = dto.EndDate;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id, int collegeId)
        {
            var semester = await _context.Semesters
                .FirstOrDefaultAsync(s => s.Id == id && s.CollegeId == collegeId);

            if (semester == null) return false;

            _context.Semesters.Remove(semester);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
