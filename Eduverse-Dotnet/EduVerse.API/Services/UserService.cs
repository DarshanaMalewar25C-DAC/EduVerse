using Microsoft.EntityFrameworkCore;
using EduVerse.API.Data;
using EduVerse.API.DTOs;
using EduVerse.API.Models;

namespace EduVerse.API.Services
{
    public class UserService
    {
        private readonly ApplicationDbContext _context;

        public UserService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<UserDto>> GetAllAsync(int collegeId)
        {
            return await _context.Users
                .AsNoTracking()
                .Include(u => u.Department)
                .Include(u => u.Role)
                .Where(u => u.CollegeId == collegeId)
                .Select(u => new UserDto
                {
                    Id = u.Id,
                    FullName = u.FullName,
                    Email = u.Email,
                    RoleId = u.RoleId,
                    RoleName = u.Role.Name,
                    DepartmentName = u.Department != null ? u.Department.Name : "N/A",
                    DepartmentId = u.DepartmentId,
                    Designation = u.Designation,
                    IsActive = u.IsActive
                })
                .ToListAsync();
        }

        public async Task<IEnumerable<UserDto>> GetTeachersAsync(int collegeId)
        {
            return await _context.Users
                .AsNoTracking()
                .Include(u => u.Department)
                .Include(u => u.Role)
                .Where(u => u.CollegeId == collegeId && u.RoleId == 3 && u.IsActive)
                .Select(u => new UserDto
                {
                    Id = u.Id,
                    FullName = u.FullName,
                    Email = u.Email,
                    RoleId = u.RoleId,
                    RoleName = u.Role.Name,
                    DepartmentName = u.Department != null ? u.Department.Name : "N/A",
                    DepartmentId = u.DepartmentId,
                    Designation = u.Designation,
                    IsActive = u.IsActive
                })
                .ToListAsync();
        }

        public async Task<UserDto?> GetByIdAsync(int id, int collegeId)
        {
            var u = await _context.Users
                .AsNoTracking()
                .Include(u => u.Department)
                .Include(u => u.Role)
                .FirstOrDefaultAsync(x => x.Id == id && x.CollegeId == collegeId);

            if (u == null) return null;

            return new UserDto
            {
                Id = u.Id,
                FullName = u.FullName,
                Email = u.Email,
                RoleId = u.RoleId,
                RoleName = u.Role.Name,
                DepartmentName = u.Department != null ? u.Department.Name : "N/A",
                DepartmentId = u.DepartmentId,
                Designation = u.Designation,
                IsActive = u.IsActive
            };
        }

        public async Task<bool> UpdateAsync(int id, UpdateUserDto dto, int collegeId)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == id && u.CollegeId == collegeId);

            if (user == null) return false;

            user.FullName = dto.FullName;
            user.Email = dto.Email;
            user.DepartmentId = dto.DepartmentId;
            user.Designation = dto.Designation;
            user.IsActive = dto.IsActive;

            if (!string.IsNullOrEmpty(dto.Password))
            {
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id, int collegeId)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == id && u.CollegeId == collegeId);

            if (user == null) return false;

            user.IsActive = false;
            await _context.SaveChangesAsync();
            return true;
        }
    }
}

