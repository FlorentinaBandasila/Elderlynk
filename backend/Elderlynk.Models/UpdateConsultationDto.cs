namespace Elderlynk.Models
{
    public class UpdateConsultationDto
    {
        public int? PatientId { get; set; }
        public int? DoctorId { get; set; }
        public string? PresentationReason { get; set; }
        public string? Symptoms { get; set; }
        public string? DiagnosisCode { get; set; }
        public string? Notes { get; set; }
    }
}
