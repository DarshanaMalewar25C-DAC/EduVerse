using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace EduVerse.API.Models
{
    public class College
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(200)]
        public string CollegeName { get; set; } = string.Empty;

        [Required]
        [StringLength(20)]
        public string CollegeCode { get; set; } = string.Empty;

        [StringLength(500)]
        public string? Address { get; set; }

        [StringLength(100)]
        public string? State { get; set; }

        [EmailAddress]
        [StringLength(100)]
        public string? ContactEmail { get; set; }

        [StringLength(20)]
        public string? ContactPhone { get; set; }

        public int? EstablishedYear { get; set; }

        public bool IsActive { get; set; } = true;

        public bool IsApproved { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [JsonIgnore]
        public ICollection<User> Users { get; set; } = new List<User>();
        [JsonIgnore]
        public ICollection<Department> Departments { get; set; } = new List<Department>();
        [JsonIgnore]
        public ICollection<Classroom> Classrooms { get; set; } = new List<Classroom>();
        [JsonIgnore]
        public ICollection<Subject> Subjects { get; set; } = new List<Subject>();
        [JsonIgnore]
        public ICollection<Semester> Semesters { get; set; } = new List<Semester>();
        [JsonIgnore]
        public ICollection<TimeSlot> TimeSlots { get; set; } = new List<TimeSlot>();
        [JsonIgnore]
        public ICollection<Timetable> Timetables { get; set; } = new List<Timetable>();
    }
}

