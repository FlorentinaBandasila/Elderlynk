using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Elderlynk.Models
{
    [Table("Masuratori_Senzori")]
    public class SensorMeasurement
    {
        [Key]
        [Column("ID_Masuratoare")]
        public long MeasurementId { get; set; }

        [Column("ID_Senzor")]
        public int? SensorId { get; set; }

        [Column("Valoare")]
        public decimal? Value { get; set; }

        [Column("Data_Ora")]
        public DateTimeOffset? MeasurementDateTime { get; set; }
    }
}
