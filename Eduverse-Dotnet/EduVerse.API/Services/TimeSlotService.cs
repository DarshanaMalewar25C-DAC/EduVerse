using Microsoft.EntityFrameworkCore;
using EduVerse.API.Data;
using EduVerse.API.DTOs;
using EduVerse.API.Models;

namespace EduVerse.API.Services
{
    public class TimeSlotService
    {
        private readonly ApplicationDbContext _context;

        public TimeSlotService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<TimeSlotDto>> GetAllAsync(int collegeId)
        {
            return await _context.TimeSlots
                .AsNoTracking()
                .Where(t => t.CollegeId == collegeId)
                .Select(t => new TimeSlotDto
                {
                    Id = t.Id,
                    Shift = t.Shift,
                    StartTime = t.StartTime,
                    EndTime = t.EndTime,
                    PeriodDurationMinutes = t.PeriodDurationMinutes,
                    BreakDurationMinutes = t.BreakDurationMinutes,
                    BreakAfterPeriod = t.BreakAfterPeriod,
                    Year = t.Year,

                })
                .ToListAsync();
        }

        public async Task<TimeSlotDto?> GetByIdAsync(int id, int collegeId)
        {
            var t = await _context.TimeSlots
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.Id == id && t.CollegeId == collegeId);

            return t == null ? null : new TimeSlotDto
            {
                Id = t.Id,
                Shift = t.Shift,
                StartTime = t.StartTime,
                EndTime = t.EndTime,
                PeriodDurationMinutes = t.PeriodDurationMinutes,
                BreakDurationMinutes = t.BreakDurationMinutes,
                BreakAfterPeriod = t.BreakAfterPeriod,
                Year = t.Year,

            };
        }

        public async Task<TimeSlotDto> CreateAsync(CreateTimeSlotDto dto, int collegeId)
        {
            var timeError = ValidateShiftTime(dto.Shift, dto.StartTime);
            if (timeError != null) throw new ArgumentException(timeError);

            var periods = CalculateTotalPeriods(dto.StartTime, dto.EndTime, dto.PeriodDurationMinutes, dto.BreakDurationMinutes, dto.BreakAfterPeriod);
            
            var timeSlot = new TimeSlot
            {
                CollegeId = collegeId,
                Shift = dto.Shift,
                StartTime = dto.StartTime,
                EndTime = dto.EndTime,
                PeriodDurationMinutes = dto.PeriodDurationMinutes,
                BreakDurationMinutes = dto.BreakDurationMinutes,
                BreakAfterPeriod = dto.BreakAfterPeriod,
                Year = dto.Year,
                TotalPeriods = periods,

            };

            _context.TimeSlots.Add(timeSlot);
            await _context.SaveChangesAsync();

            return new TimeSlotDto
            {
                Id = timeSlot.Id,
                Shift = timeSlot.Shift,
                StartTime = timeSlot.StartTime,
                EndTime = timeSlot.EndTime,
                PeriodDurationMinutes = timeSlot.PeriodDurationMinutes,
                BreakDurationMinutes = timeSlot.BreakDurationMinutes,
                BreakAfterPeriod = timeSlot.BreakAfterPeriod,
                Year = timeSlot.Year,

            };
        }

        public async Task<bool> UpdateAsync(int id, UpdateTimeSlotDto dto, int collegeId)
        {
            var timeError = ValidateShiftTime(dto.Shift, dto.StartTime);
            if (timeError != null) throw new ArgumentException(timeError);

            var timeSlot = await _context.TimeSlots
                .FirstOrDefaultAsync(t => t.Id == id && t.CollegeId == collegeId);

            if (timeSlot == null) return false;

            var periods = CalculateTotalPeriods(dto.StartTime, dto.EndTime, dto.PeriodDurationMinutes, dto.BreakDurationMinutes, dto.BreakAfterPeriod);

            timeSlot.Shift = dto.Shift;
            timeSlot.StartTime = dto.StartTime;
            timeSlot.EndTime = dto.EndTime;
            timeSlot.PeriodDurationMinutes = dto.PeriodDurationMinutes;
            timeSlot.BreakDurationMinutes = dto.BreakDurationMinutes;
            timeSlot.BreakAfterPeriod = dto.BreakAfterPeriod;
            timeSlot.Year = dto.Year;
            timeSlot.TotalPeriods = periods;


            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id, int collegeId)
        {
            var timeSlot = await _context.TimeSlots
                .FirstOrDefaultAsync(t => t.Id == id && t.CollegeId == collegeId);

            if (timeSlot == null) return false;

            _context.TimeSlots.Remove(timeSlot);
            await _context.SaveChangesAsync();
            return true;
        }

        private int CalculateTotalPeriods(TimeSpan start, TimeSpan end, int duration, int breakDuration, int breakAfter)
        {
            if (breakAfter <= 0) breakAfter = 3;
            if (duration <= 0) duration = 60;

            var availableMinutes = (end - start).TotalMinutes;
            int periods = 0;
            double currentUsed = 0;

            while (true)
            {
                if (currentUsed + duration > availableMinutes) break;
                
                currentUsed += duration;
                periods++;

                if (periods % breakAfter == 0)
                {
                    currentUsed += breakDuration;
                }
            }

            return periods;
        }

        private string? ValidateShiftTime(string shift, TimeSpan startTime)
        {
            var hours = startTime.Hours;

            if (shift == "Morning")
            {
                if (hours < 4 || hours >= 12)
                    return "Morning shift must start between 4:00 AM and 11:59 AM";
            }
            else if (shift == "Evening")
            {
                if (hours < 12 || hours >= 18)
                    return "Evening shift must start between 12:00 PM and 5:59 PM";
            }
            else if (shift == "Night")
            {
                if (hours < 18 && hours >= 4)
                    return "Night shift must start between 6:00 PM and 3:59 AM";
            }
            return null;
        }
    }
}

