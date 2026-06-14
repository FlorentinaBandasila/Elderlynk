namespace Elderlynk.Models
{
    public class UpdateConsultationDto
    {
        public int? PatientId { get; set; }
        public int? DoctorId { get; set; }
        public DateTime? ConsultationDate { get; set; }
        public string? PresentationReason { get; set; }
        public string? Symptoms { get; set; }
        public string? DiagnosisCode { get; set; }
        public string? DiagnosticText { get; set; }
        public string? Referrals { get; set; }
        public string? GeneratedPrescriptions { get; set; }
        public string? Notes { get; set; }
    }
}
