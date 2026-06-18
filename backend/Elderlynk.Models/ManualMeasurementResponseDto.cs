namespace Elderlynk.Models
{
    /// <summary>
    /// A manually recorded vitals reading for a patient, exposed to the frontend
    /// to populate the "current vitals" cards (blood pressure, glucose, weight, temperature).
    /// </summary>
    public class ManualMeasurementResponseDto
    {
        public int MeasurementId { get; set; }
        public int PatientId { get; set; }
        public int SourceUserId { get; set; }
        public decimal? TensiuneSistolica { get; set; }
        public decimal? TensiuneDiastolica { get; set; }
        public decimal? Glicemie { get; set; }
        public decimal? Greutate { get; set; }
        public decimal? Temperatura { get; set; }
        public DateTime? RecordedAt { get; set; }
        public string? Observatii { get; set; }
    }
}
