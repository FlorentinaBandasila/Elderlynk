namespace Elderlynk.Models
{
    public class MedicationSchemeResponseDto
    {
        public int MedicationId { get; set; }
        public int PatientId { get; set; }
        public int ConsultationId { get; set; }
        public string DenumireMedicament { get; set; } = null!;
        public string Doza { get; set; } = null!;
        public string? FrecventaAdministrare { get; set; }
        public string? DurataTratament { get; set; }
        public DateTime? DataPrescriere { get; set; }
        public string? ObservatiiIngrijitor { get; set; }
    }
}
