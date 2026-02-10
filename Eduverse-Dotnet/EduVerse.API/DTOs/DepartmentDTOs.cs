using System.ComponentModel.DataAnnotations;

namespace EduVerse.API.DTOs
{
    public class DepartmentDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
    }

    public class CreateDepartmentDto
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [StringLength(10)]
        [RegularExpression(@"^[A-Z0-9]+$", ErrorMessage = "Code must be alphanumeric and uppercase")]
        public string Code { get; set; } = string.Empty;

    }

    public class UpdateDepartmentDto
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [StringLength(10)]
        public string Code { get; set; } = string.Empty;
    }
}

