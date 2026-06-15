using System.ComponentModel.DataAnnotations;

namespace Elderlynk.Models.Auth
{
    public class LoginDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = null!;

        [Required]
        public string Parola { get; set; } = null!;
    }
}
