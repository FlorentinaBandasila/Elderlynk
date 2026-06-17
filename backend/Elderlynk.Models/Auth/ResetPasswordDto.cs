using System.ComponentModel.DataAnnotations;

namespace Elderlynk.Models.Auth
{
    /// <summary>Admin-initiated password reset for any account (staff or patient).</summary>
    public class ResetPasswordDto
    {
        /// <summary>Which table the account lives in: "user" (Utilizatori) or "patient" (Pacienti).</summary>
        [Required]
        [RegularExpression("^(user|patient)$", ErrorMessage = "UserType must be 'user' or 'patient'.")]
        public string UserType { get; set; } = null!;

        /// <summary>ID_Utilizator when UserType is "user", ID_Pacient when "patient".</summary>
        [Required]
        public int UserId { get; set; }

        [Required]
        [MinLength(6)]
        public string NewPassword { get; set; } = null!;
    }
}
