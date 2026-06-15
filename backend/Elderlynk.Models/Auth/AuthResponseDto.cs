namespace Elderlynk.Models.Auth
{
    public class AuthResponseDto
    {
        public string Token { get; set; } = null!;

        /// <summary>ID_Utilizator for staff accounts, ID_Pacient for patients.</summary>
        public int UserId { get; set; }

        public string Email { get; set; } = null!;

        public string? Nume { get; set; }

        /// <summary>Primary (most privileged) role id as string, e.g. "2".</summary>
        public string Role { get; set; } = null!;

        /// <summary>All role ids held by the account.</summary>
        public int[] Roles { get; set; } = System.Array.Empty<int>();

        /// <summary>"user" (Utilizatori) or "patient" (Pacienti).</summary>
        public string UserType { get; set; } = null!;

        public System.DateTime ExpiresAt { get; set; }
    }
}
