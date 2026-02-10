using Microsoft.EntityFrameworkCore;
using EduVerse.API.Data;
using EduVerse.API.DTOs;
using EduVerse.API.Models;

namespace EduVerse.API.Services
{
    public class DepartmentService
    {
        private readonly ApplicationDbContext _context;

        public DepartmentService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<DepartmentDto>> GetAllAsync(int collegeId)
        {
            return await _context.Departments
                .AsNoTracking()
                .Where(d => d.CollegeId == collegeId)
                .Select(d => new DepartmentDto
                {
                    Id = d.Id,
                    Name = d.Name,
                    Code = d.Code
                })
                .ToListAsync();
        }

        public async Task<DepartmentDto?> GetByIdAsync(int id, int collegeId)
        {
            var d = await _context.Departments
                .AsNoTracking()
                .FirstOrDefaultAsync(d => d.Id == id && d.CollegeId == collegeId);

            return d == null ? null : new DepartmentDto
            {
                Id = d.Id,
                Name = d.Name,
                Code = d.Code
            };
        }

        public async Task<DepartmentDto> CreateAsync(CreateDepartmentDto dto, int collegeId)
        {
            if (await _context.Departments.AnyAsync(d => d.CollegeId == collegeId && d.Code == dto.Code))
                throw new InvalidOperationException("Department code already exists.");

            var department = new Department
            {
                CollegeId = collegeId,
                Name = dto.Name,
                Code = dto.Code
            };

            _context.Departments.Add(department);
            await _context.SaveChangesAsync();

            return new DepartmentDto
            {
                Id = department.Id,
                Name = department.Name,
                Code = department.Code
            };
        }

        public async Task<bool> UpdateAsync(int id, UpdateDepartmentDto dto, int collegeId)
        {
            var department = await _context.Departments
                .FirstOrDefaultAsync(d => d.Id == id && d.CollegeId == collegeId);

            if (department == null) return false;

            department.Name = dto.Name;
            department.Code = dto.Code;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id, int collegeId)
        {
            var department = await _context.Departments
                .FirstOrDefaultAsync(d => d.Id == id && d.CollegeId == collegeId);

            if (department == null) return false;

            _context.Departments.Remove(department);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
