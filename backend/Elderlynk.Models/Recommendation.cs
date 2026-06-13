using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Elderlynk.Models
{
    [Table("Recomandari")]
    public class Recommendation
    {
        [Key]
        [Column("ID_Recomandare")]
        public int RecommendationId { get; set; }

        [Column("ID_Pacient")]
        public int? PatientId { get; set; }

        [Column("ID_Medic")]
        public int? DoctorId { get; set; }

        [Column("Tip_Activitate")]
        [MaxLength(50)]
        public string? ActivityType { get; set; }

        [Column("Durata_Zilnica_Minute")]
        public int? DailyDurationMinutes { get; set; }

        [Column("Descriere")]
        public string? Description { get; set; }

        [Column("Data_Start")]
        public DateTime? StartDate { get; set; }

        [Column("Data_Stop")]
        public DateTime? StopDate { get; set; }
    }
}
