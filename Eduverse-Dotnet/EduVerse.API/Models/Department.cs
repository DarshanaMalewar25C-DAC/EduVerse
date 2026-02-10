using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System.Text.Json.Serialization;

namespace EduVerse.API.Models
{
    public class Department
    {
        [Key]
        public int Id { get; set; }

        public int CollegeId { get; set; }

        [ForeignKey("CollegeId")]
        [ValidateNever]
        public College College { get; set; } = null!;

        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [StringLength(10)]
        public string Code { get; set; } = string.Empty;

        [JsonIgnore]
        public ICollection<Subject> Subjects { get; set; } = new List<Subject>();
        [JsonIgnore]
        public ICollection<User> Users { get; set; } = new List<User>();
    }
}

