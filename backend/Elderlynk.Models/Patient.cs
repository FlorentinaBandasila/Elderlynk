using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Elderlynk.Models
{
    [Table("Pacienti")]
    public class Patient
    {
        [Key]
        [Column("ID_Pacient")]
        public int PatientId { get; set; }

        [Column("CNP")]
        public string CNP { get; set; } = null!;

        [Column("Varsta")]
        public int? Age { get; set; }

        [Column("Adresa_Strada")]
        public string? Street { get; set; }

        [Column("Adresa_Oras")]
        public string? City { get; set; }

        [Column("Adresa_Judet")]
        public string? County { get; set; }

        [Column("Profesie")]
        public string? Profession { get; set; }

        [Column("Loc_Munca")]
        public string? WorkPlace { get; set; }

        [Column("ID_Medic_Familie")]
        public int? FamilyDoctorId { get; set; }
    }
}
