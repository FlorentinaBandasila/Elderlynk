namespace Elderlynk.Models
{
    public class DoctorResponseDto
    {
        public int DoctorId { get; set; }
        public string Email { get; set; } = null!;
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Phone { get; set; }
        public string? Specialty { get; set; }
        public bool? Active { get; set; }
    }
}
