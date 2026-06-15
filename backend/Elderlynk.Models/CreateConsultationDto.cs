namespace Elderlynk.Models
{
    public class CreateConsultationDto
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

        // ===== Date medicale (optionale, adaugate odata cu consultatia) =====
        // Alergiile se leaga de pacient; recomandarile si schemele de aceasta consultatie.
        public List<CreateAllergyDto>? Allergies { get; set; }
        public List<CreatePatientRecommendationDto>? Recommendations { get; set; }
        public List<CreateMedicationSchemeDto>? Medications { get; set; }
    }
}
