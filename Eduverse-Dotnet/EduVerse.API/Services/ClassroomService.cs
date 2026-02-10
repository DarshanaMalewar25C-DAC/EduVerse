using Microsoft.EntityFrameworkCore;
using EduVerse.API.Data;
using EduVerse.API.DTOs;
using EduVerse.API.Models;

namespace EduVerse.API.Services
{
    public class ClassroomService
    {
        private readonly ApplicationDbContext _context;

        public ClassroomService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<ClassroomDto>> GetAllAsync(int collegeId)
        {
            return await _context.Classrooms
                .AsNoTracking()
                .Where(c => c.CollegeId == collegeId)
                .Select(c => new ClassroomDto
                {
                    Id = c.Id,
                    RoomNumber = c.RoomNumber,
                    Building = c.Building,
                    Capacity = c.Capacity
                })
                .ToListAsync();
        }

        public async Task<ClassroomDto?> GetByIdAsync(int id, int collegeId)
        {
            var c = await _context.Classrooms
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == id && c.CollegeId == collegeId);

            return c == null ? null : MapToDto(c);
        }

        public async Task<ClassroomDto> CreateAsync(CreateClassroomDto dto, int collegeId)
        {
            var exists = await _context.Classrooms.AnyAsync(c =>
                c.CollegeId == collegeId &&
                c.RoomNumber == dto.RoomNumber &&
                c.Building == dto.Building);

            if (exists)
                throw new InvalidOperationException("Classroom already exists.");

            var classroom = new Classroom
            {
                CollegeId = collegeId,
                RoomNumber = dto.RoomNumber,
                Building = dto.Building,
                Capacity = dto.Capacity
            };

            _context.Classrooms.Add(classroom);
            await _context.SaveChangesAsync();

            return MapToDto(classroom);
        }

        public async Task<bool> UpdateAsync(int id, UpdateClassroomDto dto, int collegeId)
        {
            var classroom = await _context.Classrooms
                .FirstOrDefaultAsync(c => c.Id == id && c.CollegeId == collegeId);

            if (classroom == null) return false;

            classroom.RoomNumber = dto.RoomNumber;
            classroom.Building = dto.Building;
            classroom.Capacity = dto.Capacity;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id, int collegeId)
        {
            var classroom = await _context.Classrooms
                .FirstOrDefaultAsync(c => c.Id == id && c.CollegeId == collegeId);

            if (classroom == null) return false;

            _context.Classrooms.Remove(classroom);
            await _context.SaveChangesAsync();
            return true;
        }

        private static ClassroomDto MapToDto(Classroom c) => new()
        {
            Id = c.Id,
            RoomNumber = c.RoomNumber,
            Building = c.Building,
            Capacity = c.Capacity
        };
    }
}
