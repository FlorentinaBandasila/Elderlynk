namespace Elderlynk.Services
{
    /// <summary>
    /// Authenticated identity resolved from either the Utilizatori or Pacienti table.
    /// The Web layer turns this into a signed JWT.
    /// </summary>
    public class AuthPrincipal
    {
        /// <summary>ID_Utilizator for staff, ID_Pacient for patients.</summary>
        public int UserId { get; set; }
        public string Email { get; set; } = null!;
        public string? Nume { get; set; }
        /// <summary>All role ids held by the account. Patients always have [4].</summary>
        public int[] Roles { get; set; } = System.Array.Empty<int>();
        /// <summary>"user" (Utilizatori) or "patient" (Pacienti).</summary>
        public string UserType { get; set; } = null!;
    }
}
