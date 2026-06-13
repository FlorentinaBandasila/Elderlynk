namespace Elderlynk.Models
{
    public class CreateDoctorDto
    {
        public string Email { get; set; } = null!;
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Phone { get; set; }
        public string? Specialty { get; set; }
    }
}
