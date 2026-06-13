using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Elderlynk.Models
{
    [Table("Medici")]
    public class Doctor
    {
        [Key]
        [Column("ID_Medic")]
        public int DoctorId { get; set; }

        [Column("Email")]
        [Required]
        [MaxLength(100)]
        public string Email { get; set; } = null!;

        [Column("Nume")]
        [MaxLength(100)]
        public string? FirstName { get; set; }

        [Column("Prenume")]
        [MaxLength(100)]
        public string? LastName { get; set; }

        [Column("Telefon")]
        [MaxLength(20)]
        public string? Phone { get; set; }

        [Column("Specialitate")]
        [MaxLength(100)]
        public string? Specialty { get; set; }

        [Column("Activ")]
        public bool? Active { get; set; }
    }
}
