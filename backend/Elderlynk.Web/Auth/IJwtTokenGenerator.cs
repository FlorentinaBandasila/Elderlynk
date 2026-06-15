using Elderlynk.Services;

namespace Elderlynk.Web.Auth
{
    public interface IJwtTokenGenerator
    {
        (string token, DateTime expiresAt) Generate(AuthPrincipal principal);
    }
}
