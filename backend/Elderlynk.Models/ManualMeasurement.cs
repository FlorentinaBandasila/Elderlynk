using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Elderlynk.Models
{
    /// <summary>
    /// A manually recorded set of vitals for a patient (blood pressure, glucose,
    /// weight, temperature), entered by a caregiver/medic rather than a sensor.
    /// </summary>
    [Table("Masuratori_Manuale")]
    public class ManualMeasurement
    {
        [Key]
        [Column("ID_Masuratoare")]
        public int MeasurementId { get; set; }

        [Column("ID_Pacient")]
        public int PatientId { get; set; }

        [Column("ID_Utilizator_Sursa")]
        public int SourceUserId { get; set; }

        [Column("Tensiune_Sistolica")]
        public decimal? TensiuneSistolica { get; set; }

        [Column("Tensiune_Diastolica")]
        public decimal? TensiuneDiastolica { get; set; }

        [Column("Glicemie")]
        public decimal? Glicemie { get; set; }

        [Column("Greutate")]
        public decimal? Greutate { get; set; }

        [Column("Temperatura")]
        public decimal? Temperatura { get; set; }

        [Column("Data_Inregistrarii")]
        public DateTime? RecordedAt { get; set; }

        [Column("Observatii")]
        public string? Observatii { get; set; }
    }
}
