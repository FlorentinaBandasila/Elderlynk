namespace Elderlynk.Models
{
    public class MedicalHistoryResponseDto
    {
        public int HistoryId { get; set; }
        public int PatientId { get; set; }
        public string Diagnostic { get; set; } = null!;
        public string? Tratament { get; set; }
        public DateTime? DataDiagnostic { get; set; }
        public string? Observatii { get; set; }
    }
}
