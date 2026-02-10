using System.ComponentModel.DataAnnotations;

namespace EduVerse.API.Models
{
    public class EmailVerification
    {
        [Key]
        [EmailAddress]
        [StringLength(100)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [StringLength(10)]
        public string OtpCode { get; set; } = string.Empty;

        [Required]
        public DateTime Expiry { get; set; }

        public bool IsVerified { get; set; } = false;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}

