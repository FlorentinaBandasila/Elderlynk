namespace Elderlynk.Models
{
    public class CreatePatientDto
    {
        // ===== Date demografice =====
        public string? LastName { get; set; }
        public string? FirstName { get; set; }
        public string CNP { get; set; } = null!;
        public string? Street { get; set; }
        public string? City { get; set; }
        public string? County { get; set; }
        public string? PostalCode { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? Profession { get; set; }
        public string? WorkPlace { get; set; }

        // ===== Date medicale (optionale, adaugate odata cu pacientul) =====
        public List<CreateAllergyDto>? Allergies { get; set; }
        public List<CreateMedicalHistoryDto>? MedicalHistory { get; set; }
        public List<CreatePatientRecommendationDto>? Recommendations { get; set; }
        public List<CreateMedicationSchemeDto>? Medications { get; set; }
    }

    public class CreateAllergyDto
    {
        public string Denumire { get; set; } = null!;
    }

    public class CreateMedicalHistoryDto
    {
        public string Diagnostic { get; set; } = null!;
        public string? Tratament { get; set; }
        public DateTime? DataDiagnostic { get; set; }
        public string? Observatii { get; set; }
    }

    public class CreatePatientRecommendationDto
    {
        public string? TipRecomandare { get; set; }
        public string Descriere { get; set; } = null!;
    }

    public class CreateMedicationSchemeDto
    {
        public string DenumireMedicament { get; set; } = null!;
        public string Doza { get; set; } = null!;
        public string? FrecventaAdministrare { get; set; }
        public string? DurataTratament { get; set; }
        public string? ObservatiiIngrijitor { get; set; }
    }
}
