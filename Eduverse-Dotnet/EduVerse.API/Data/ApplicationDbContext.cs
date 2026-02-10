using Microsoft.EntityFrameworkCore;
using EduVerse.API.Models;

namespace EduVerse.API.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<College> Colleges { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<Department> Departments { get; set; }
        public DbSet<Classroom> Classrooms { get; set; }
        public DbSet<Subject> Subjects { get; set; }
        public DbSet<Semester> Semesters { get; set; }
        public DbSet<TimeSlot> TimeSlots { get; set; }
        public DbSet<Timetable> Timetables { get; set; }
        public DbSet<TimetableEntry> TimetableEntries { get; set; }
        public DbSet<EmailVerification> EmailVerifications { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    base.OnModelCreating(modelBuilder);

    modelBuilder.Entity<College>()
        .HasIndex(c => c.CollegeCode)
        .IsUnique();
    modelBuilder.Entity<User>()
        .HasIndex(u => new { u.Email, u.CollegeId })
        .IsUnique();
    modelBuilder.Entity<Department>()
        .HasIndex(d => new { d.CollegeId, d.Code })
        .IsUnique();
    modelBuilder.Entity<Classroom>()
        .HasIndex(c => new { c.CollegeId, c.Building, c.RoomNumber })
        .IsUnique();
    modelBuilder.Entity<Subject>()
        .HasIndex(s => new { s.DepartmentId, s.Code })
        .IsUnique();
    modelBuilder.Entity<Semester>()
        .HasIndex(s => new { s.CollegeId, s.Code })
        .IsUnique();

    modelBuilder.Entity<TimeSlot>()
        .HasIndex(t => new { t.CollegeId, t.Shift, t.StartTime, t.EndTime })
        .IsUnique();

    modelBuilder.Entity<Role>()
        .HasIndex(r => r.Name)
        .IsUnique();

    modelBuilder.Entity<TimetableEntry>()
        .HasIndex(e => new { e.TimetableId, e.DayOfWeek, e.PeriodNumber })
        .IsUnique();

    modelBuilder.Entity<Timetable>()
        .HasOne(t => t.GeneratedBy)
        .WithMany(u => u.GeneratedTimetables)
        .HasForeignKey(t => t.GeneratedByUserId)
        .OnDelete(DeleteBehavior.Restrict);

    modelBuilder.Entity<Timetable>()
        .HasOne(t => t.ApprovedBy)
        .WithMany(u => u.ApprovedTimetables)
        .HasForeignKey(t => t.ApprovedByUserId)
        .OnDelete(DeleteBehavior.Restrict);

    modelBuilder.Entity<TimetableEntry>()
        .HasOne(te => te.Teacher)
        .WithMany(u => u.TimetableEntries)
        .HasForeignKey(te => te.TeacherId)
        .OnDelete(DeleteBehavior.Restrict);

    modelBuilder.Entity<Subject>()
        .HasOne(s => s.Teacher)
        .WithMany()
        .HasForeignKey(s => s.TeacherId)
        .OnDelete(DeleteBehavior.Restrict);

    SeedData(modelBuilder);
}
        private void SeedData(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Role>().HasData(
                new Role { Id = 1, Name = "Admin", Description = "College Administrator" },
                new Role { Id = 2, Name = "HOD", Description = "Head of Department" },
                new Role { Id = 3, Name = "Teacher", Description = "Teaching Faculty" }
            );

        }
    }
}

