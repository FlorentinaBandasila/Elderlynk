using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Elderlynk.Models
{
    [Table("Consultatii")]
    public class Consultation
    {
        [Key]
        [Column("ID_Consultatie")]
        public int ConsultationId { get; set; }

        [Column("ID_Pacient")]
        public int? PatientId { get; set; }

        [Column("ID_Medic")]
        public int? DoctorId { get; set; }

        [Column("Data_Consultatie")]
        public DateTime? ConsultationDate { get; set; }

        [Column("Motiv_Prezentare")]
        public string? PresentationReason { get; set; }

        [Column("Simptome")]
        public string? Symptoms { get; set; }

        [Column("Diagnostic_Cod_ICD9")]
        [MaxLength(10)]
        public string? DiagnosisCode { get; set; }

        [Column("Diagnostic_Text")]
        public string? DiagnosticText { get; set; }

        [Column("Trimiteri")]
        public string? Referrals { get; set; }

        [Column("Retete_Generate")]
        public string? GeneratedPrescriptions { get; set; }

        [Column("Observatii")]
        public string? Notes { get; set; }
    }
}
