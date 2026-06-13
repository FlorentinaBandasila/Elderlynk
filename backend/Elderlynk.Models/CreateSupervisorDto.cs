namespace Elderlynk.Models
{
    public class CreateSupervisorDto
    {
        public string Email { get; set; } = null!;
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Phone { get; set; }
        public string? Department { get; set; }
    }
}
