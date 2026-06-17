namespace Elderlynk.Models
{
    /// <summary>Request to generate an outbound HL7 specialist referral.</summary>
    public class GenerateReferralDto
    {
        public int PatientId { get; set; }
        public int? ConsultationId { get; set; }

        /// <summary>Target specialty (e.g. "Cardiologie").</summary>
        public string? Specialty { get; set; }

        /// <summary>Reason for the referral.</summary>
        public string? Reason { get; set; }

        /// <summary>Optional extra clinical information for the specialist.</summary>
        public string? ClinicalInfo { get; set; }
    }
}
