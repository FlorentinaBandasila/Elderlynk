using System.ComponentModel.DataAnnotations;

namespace Elderlynk.Models.Auth
{
    public class RegisterPatientDto
    {
        [MaxLength(50)]
        public string? LastName { get; set; }

        [MaxLength(50)]
        public string? FirstName { get; set; }

        [Required]
        [StringLength(13, MinimumLength = 13)]
        public string CNP { get; set; } = null!;

        [EmailAddress]
        [MaxLength(100)]
        public string? Email { get; set; }

        [Required]
        [MinLength(6)]
        public string Parola { get; set; } = null!;

        public string? Street { get; set; }
        public string? City { get; set; }
        public string? County { get; set; }
        public string? PostalCode { get; set; }
        public string? Phone { get; set; }
        public string? Profession { get; set; }
        public string? WorkPlace { get; set; }

        /// <summary>Optional reason recorded on the initial consultation that links the patient to the creating medic.</summary>
        public string? PresentationReason { get; set; }
    }
}
