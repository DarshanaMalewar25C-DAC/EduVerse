using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;

namespace EduVerse.API.Models
{
    public class Classroom
    {
        [Key]
        public int Id { get; set; }

        public int CollegeId { get; set; }

        [ForeignKey("CollegeId")]
        [ValidateNever]
        public College College { get; set; } = null!;

        [Required]
        [StringLength(50)]
        public string RoomNumber { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Building { get; set; } = string.Empty;

        [Range(1, 500)]
        public int Capacity { get; set; }


        public ICollection<TimetableEntry> TimetableEntries { get; set; } = new List<TimetableEntry>();
    }
}

