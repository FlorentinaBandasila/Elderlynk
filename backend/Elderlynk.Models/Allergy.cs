using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Elderlynk.Models
{
    [Table("Alergii")]
    public class Allergy
    {
        [Key]
        [Column("ID_Alergie")]
        public int AllergyId { get; set; }

        [Column("ID_Pacient")]
        public int PatientId { get; set; }

        [Column("Denumire_Alergie")]
        [MaxLength(255)]
        public string Denumire { get; set; } = null!;
    }
}
