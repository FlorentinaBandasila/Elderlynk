using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Elderlynk.Models
{
    [Table("Scheme_Medicatie")]
    public class MedicationScheme
    {
        [Key]
        [Column("ID_Medicatie")]
        public int MedicationId { get; set; }

        [Column("ID_Pacient")]
        public int PatientId { get; set; }

        [Column("ID_Consultatie")]
        public int ConsultationId { get; set; }

        [Column("Denumire_Medicament")]
        public string DenumireMedicament { get; set; } = null!;

        [Column("Doza")]
        public string Doza { get; set; } = null!;

        [Column("Frecventa_Administrare")]
        public string? FrecventaAdministrare { get; set; }

        [Column("Durata_Tratament")]
        public string? DurataTratament { get; set; }

        [Column("Data_Prescriere")]
        public DateTime? DataPrescriere { get; set; }

        [Column("Observatii_Ingrijitor")]
        public string? ObservatiiIngrijitor { get; set; }
    }
}
