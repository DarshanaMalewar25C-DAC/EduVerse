using System.ComponentModel.DataAnnotations;

namespace EduVerse.API.Models
{
    public class Role
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(50)]
        public string Name { get; set; } = string.Empty;

        [StringLength(200)]
        public string? Description { get; set; }

        public ICollection<User> Users { get; set; } = new List<User>();
    }
}

