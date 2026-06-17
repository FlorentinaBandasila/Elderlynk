using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Elderlynk.Models
{
    [Table("Senzori_Configurare")]
    public class SensorConfig
    {
        [Key]
        [Column("ID_Senzor")]
        public int SensorId { get; set; }

        [Column("ID_Dispozitiv")]
        public int? DeviceId { get; set; }

        [Column("Nr_Ordine")]
        public int? OrderNumber { get; set; }

        [Column("Nume_Senzor")]
        [MaxLength(100)]
        public string? Name { get; set; }

        [Column("Tip_Senzor")]
        [MaxLength(50)]
        public string? SensorType { get; set; }

        [Column("Unitate_Masura")]
        [MaxLength(10)]
        public string? MeasurementUnit { get; set; }

        [Column("Perioada_Esantionare_Sec")]
        public int? SamplingPeriodSeconds { get; set; }

        [Column("Factor_Scala")]
        public decimal? ScaleFactor { get; set; }

        [Column("Prag_Alarm_Inf")]
        public decimal? LowerAlarmThreshold { get; set; }

        [Column("Prag_Atentionare_Inf")]
        public decimal? LowerWarningThreshold { get; set; }

        [Column("Prag_Atentionare_Sup")]
        public decimal? UpperWarningThreshold { get; set; }

        [Column("Prag_Alarm_Sup")]
        public decimal? UpperAlarmThreshold { get; set; }

        [Column("Activ")]
        public bool? Active { get; set; }

        // ===== Annex 3 alarm-rule conditions =====
        // How long (seconds) a reading must stay out of range before an alarm fires.
        [Column("Durata_Persistenta_Sec")]
        public int? PersistenceSeconds { get; set; }

        // Grace period (seconds) after the start of physical activity during which
        // out-of-range readings are tolerated (suppressed).
        [Column("Intarziere_Post_Activitate_Sec")]
        public int? ActivityGraceSeconds { get; set; }
    }
}
