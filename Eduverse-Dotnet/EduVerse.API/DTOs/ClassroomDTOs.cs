using System.ComponentModel.DataAnnotations;

namespace EduVerse.API.DTOs
{
    public class ClassroomDto
    {
        public int Id { get; set; }
        public string RoomNumber { get; set; } = string.Empty;
        public string Building { get; set; } = string.Empty;
        public int Capacity { get; set; }
    }

    public class CreateClassroomDto
    {
        [Required]
        [StringLength(50)]
        [RegularExpression(@"^[A-Z0-9\-]+$", ErrorMessage = "Room Number must be alphanumeric")]
        public string RoomNumber { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Building { get; set; } = string.Empty;

        [Range(1, 500)]
        public int Capacity { get; set; }

    }

    public class UpdateClassroomDto
    {
        [Required]
        [StringLength(50)]
        public string RoomNumber { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Building { get; set; } = string.Empty;

        [Range(1, 500)]
        public int Capacity { get; set; }
    }
}

