namespace Elderlynk.Models
{
    public class PatientResponseDto
    {
        public int PatientId { get; set; }
        public string CNP { get; set; } = null!;
        public int? Age { get; set; }
        public string? Street { get; set; }
        public string? City { get; set; }
        public string? County { get; set; }
        public string? Profession { get; set; }
        public string? WorkPlace { get; set; }
        public int? FamilyDoctorId { get; set; }
    }
}
