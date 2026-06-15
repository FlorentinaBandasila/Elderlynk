using System.Security.Claims;

namespace Elderlynk.Web.Auth
{
    /// <summary>
    /// Custom claim type names embedded in every CareLink JWT.
    /// </summary>
    public static class CareLinkClaims
    {
        public const string UserId = "userId";
        public const string Role = "role";        // primary (most privileged) role id
        public const string Nume = "nume";
        public const string UserType = "userType"; // "user" | "patient"
    }

    public static class ClaimsPrincipalExtensions
    {
        public static int GetUserId(this ClaimsPrincipal user)
        {
            var value = user.FindFirst(CareLinkClaims.UserId)?.Value;
            return int.TryParse(value, out var id)
                ? id
                : throw new UnauthorizedAccessException("Missing userId claim.");
        }

        /// <summary>Primary (most privileged) role id.</summary>
        public static int GetRole(this ClaimsPrincipal user)
        {
            var value = user.FindFirst(CareLinkClaims.Role)?.Value;
            return int.TryParse(value, out var role) ? role : 0;
        }

        public static string GetUserType(this ClaimsPrincipal user) =>
            user.FindFirst(CareLinkClaims.UserType)?.Value ?? "user";

        public static bool IsInRoleId(this ClaimsPrincipal user, int roleId) =>
            user.IsInRole(roleId.ToString());
    }
}
