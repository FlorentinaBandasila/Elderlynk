using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Elderlynk.Models
{
    [Table("Alarme_Evenimente")]
    public class Alarm
    {
        [Key]
        [Column("ID_Alarma")]
        public int AlarmId { get; set; }

        [Column("ID_Senzor")]
        public int? SensorId { get; set; }

        [Column("ID_Pacient")]
        public int? PatientId { get; set; }

        [Column("Tip_Alarma")]
        [MaxLength(20)]
        public string? AlarmType { get; set; }

        [Column("Mesaj")]
        public string? Message { get; set; }

        [Column("Data_Declansare")]
        public DateTime? TriggerDate { get; set; }

        [Column("Data_Rezolvare")]
        public DateTime? ResolutionDate { get; set; }

        [Column("ID_Supraveghetor")]
        public int? SupervisorId { get; set; }

        [Column("Observatii_Rezolvare")]
        public string? ResolutionNotes { get; set; }

        [Column("Status_Rezolvat")]
        public bool? IsResolved { get; set; }
    }
}
