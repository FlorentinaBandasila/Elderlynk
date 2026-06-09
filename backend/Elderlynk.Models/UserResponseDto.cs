namespace Elderlynk.Models
{
    public class UserResponseDto
    {
        public int UserId { get; set; }
        public string Email { get; set; } = null!;
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Phone { get; set; }
        public DateTimeOffset? CreatedDate { get; set; }
        public bool? Active { get; set; }
    }
}
