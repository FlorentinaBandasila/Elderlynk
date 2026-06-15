using System.ComponentModel.DataAnnotations;

namespace Elderlynk.Models.Auth
{
    public class RegisterUserDto
    {
        [Required]
        [EmailAddress]
        [MaxLength(100)]
        public string Email { get; set; } = null!;

        [Required]
        [MinLength(6)]
        public string Parola { get; set; } = null!;

        [MaxLength(50)]
        public string? Nume { get; set; }

        [MaxLength(50)]
        public string? Prenume { get; set; }

        [MaxLength(20)]
        public string? Telefon { get; set; }

        /// <summary>Role to assign: 1=Admin, 2=Medic, 3=Supraveghetor. Patients are created via register-pacient.</summary>
        [Required]
        [Range(1, 3)]
        public int RoleId { get; set; }
    }
}
