using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Elderlynk.Models
{
    [Table("Recomandari_Medicale")]
    public class MedicalRecommendation
    {
        [Key]
        [Column("ID_Recomandare")]
        public int RecommendationId { get; set; }

        [Column("ID_Pacient")]
        public int PatientId { get; set; }

        [Column("ID_Consultatie")]
        public int ConsultationId { get; set; }

        [Column("Data_Recomandarii")]
        public DateTime DataRecomandarii { get; set; }

        [Column("Tip_Recomandare")]
        [MaxLength(200)]
        public string? TipRecomandare { get; set; }

        [Column("Descriere")]
        public string? Descriere { get; set; }
    }
}
