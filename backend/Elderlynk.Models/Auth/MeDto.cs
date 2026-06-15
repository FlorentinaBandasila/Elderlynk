namespace Elderlynk.Models.Auth
{
    public class MeDto
    {
        public int UserId { get; set; }
        public string Email { get; set; } = null!;
        public string? Nume { get; set; }
        public string Role { get; set; } = null!;
        public int[] Roles { get; set; } = System.Array.Empty<int>();
        public string UserType { get; set; } = null!;
    }
}
