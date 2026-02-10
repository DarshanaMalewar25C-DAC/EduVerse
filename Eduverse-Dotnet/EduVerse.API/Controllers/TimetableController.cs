using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EduVerse.API.Data;
using EduVerse.API.Models;
using EduVerse.API.Services;
using EduVerse.API.DTOs;
using System.Security.Claims;

namespace EduVerse.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TimetableController : BaseController
    {
        private readonly ApplicationDbContext _context;
        private readonly TimetableGenerationService _timetableService;

        public TimetableController(ApplicationDbContext context, TimetableGenerationService timetableService)
        {
            _context = context;
            _timetableService = timetableService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var query = _context.Timetables
                .Include(t => t.Semester)
                .Include(t => t.GeneratedBy)
                .Where(t => t.CollegeId == CurrentCollegeId);

            if (CurrentUserRole != "1")
            {
                var user = await _context.Users.FindAsync(CurrentUserId);
                if (user?.DepartmentId != null)
                {
                    query = query.Where(t => t.Entries.Any(e => e.Subject.DepartmentId == user.DepartmentId));
                }
            }

            var timetables = await query
                .OrderByDescending(t => t.GeneratedDate)
                .Select(t => new
                {
                    t.Id,
                    t.Name,
                    SemesterName = t.Semester != null ? t.Semester.Name : "N/A",
                    SemesterId = t.SemesterId,
                    DepartmentId = t.Entries.Select(e => e.Subject.DepartmentId).FirstOrDefault(),
                    t.Year,
                    GeneratedBy = t.GeneratedBy != null ? t.GeneratedBy.FullName : "System",
                    t.GeneratedDate,
                    t.Status,
                    t.OptimizationScore,
                    t.IsActive
                })
                .ToListAsync();

            if (CurrentUserRole == "3")
            {
                timetables = timetables.Where(t => t.Status == "Approved").ToList();
            }

            return Ok(timetables);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var exists = await _context.Timetables.AnyAsync(t => t.Id == id && t.CollegeId == CurrentCollegeId);
            if (!exists) return NotFound();

            var timetable = await _timetableService.GetTimetableDtoAsync(id);
            if (timetable == null)
                return NotFound();
            return Ok(timetable);
        }

        [HttpPost("generate")]
        public async Task<IActionResult> Generate([FromBody] TimetableGenerationRequest request)
        {
            var response = await _timetableService.GenerateTimetablesAsync(request, CurrentUserId);

            if (!response.Success)
                return BadRequest(response);

            return Ok(response);
        }

        [HttpPost("approve")]
        public async Task<IActionResult> Approve([FromBody] TimetableApprovalRequest request)
        {
            if (CurrentUserRole != "2")
                return Forbid();

            var exists = await _context.Timetables.AnyAsync(t => t.Id == request.TimetableId && t.CollegeId == CurrentCollegeId);
            if (!exists) return NotFound();

            var success = await _timetableService.ApproveTimetableAsync(request, CurrentUserId);

            if (!success)
                return NotFound();

            return Ok(new { message = "Timetable approval status updated" });
        }

        [HttpGet("semester/{semesterId}")]
        public async Task<IActionResult> GetBySemester(int semesterId)
        {
            var query = _context.Timetables
                .Include(t => t.Semester)
                .Include(t => t.GeneratedBy)
                .Where(t => t.SemesterId == semesterId && t.CollegeId == CurrentCollegeId);

            if (CurrentUserRole != "1")
            {
                var user = await _context.Users.FindAsync(CurrentUserId);
                if (user?.DepartmentId != null)
                {
                    query = query.Where(t => t.Entries.Any(e => e.Subject.DepartmentId == user.DepartmentId));
                }
            }

            var timetables = await query
                .OrderByDescending(t => t.GeneratedDate)
                .Select(t => new
                {
                    t.Id,
                    t.Name,
                    t.Year,
                    SemesterId = t.SemesterId,
                    DepartmentId = t.Entries.Select(e => e.Subject.DepartmentId).FirstOrDefault(),
                    GeneratedBy = t.GeneratedBy != null ? t.GeneratedBy.FullName : "System",
                    t.GeneratedDate,
                    t.Status,
                    t.OptimizationScore,
                    t.IsActive
                })
                .ToListAsync();

            if (CurrentUserRole == "3")
            {
                timetables = timetables.Where(t => t.Status == "Approved").ToList();
            }

            return Ok(timetables);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            if (CurrentUserRole != "1")
                return Forbid();

            var timetable = await _context.Timetables
                .Include(t => t.Entries)
                .FirstOrDefaultAsync(t => t.Id == id && t.CollegeId == CurrentCollegeId);

            if (timetable == null)
                return NotFound();

            if (timetable.Entries != null && timetable.Entries.Any())
            {
                _context.TimetableEntries.RemoveRange(timetable.Entries);
            }

            _context.Timetables.Remove(timetable);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}

