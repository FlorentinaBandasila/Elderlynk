using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Elderlynk.Models
{
    [Table("Istoric_Medical")]
    public class MedicalHistory
    {
        [Key]
        [Column("ID_Istoric")]
        public int HistoryId { get; set; }

        [Column("ID_Pacient")]
        public int PatientId { get; set; }

        [Column("Diagnostic")]
        public string Diagnostic { get; set; } = null!;

        [Column("Tratament")]
        public string? Tratament { get; set; }

        [Column("Data_Diagnostic")]
        public DateTime? DataDiagnostic { get; set; }

        [Column("Observatii")]
        public string? Observatii { get; set; }
    }
}
