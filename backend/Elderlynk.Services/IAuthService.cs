using Elderlynk.Models.Auth;

namespace Elderlynk.Services
{
    public interface IAuthService
    {
        /// <summary>Checks Utilizatori first, then Pacienti. Returns null when credentials are invalid.</summary>
        Task<AuthPrincipal?> AuthenticateAsync(string email, string parola, CancellationToken cancellationToken = default);

        /// <summary>Creates a staff account (Utilizatori) and assigns the requested role.</summary>
        Task<AuthPrincipal> RegisterUserAsync(RegisterUserDto dto, int? actingUserId, string? sourceIp, CancellationToken cancellationToken = default);

        /// <summary>
        /// Creates a patient (Pacienti) and an initial Consultatii row linking the patient to the
        /// calling medic. Returns the new patient id.
        /// </summary>
        Task<int> RegisterPatientAsync(RegisterPatientDto dto, int medicUserId, string? sourceIp, CancellationToken cancellationToken = default);

        /// <summary>Rebuilds an AuthPrincipal for the current token holder (used by /me).</summary>
        Task<AuthPrincipal?> GetPrincipalAsync(int userId, string userType, CancellationToken cancellationToken = default);
    }
}
