using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Elderlynk.Services;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace Elderlynk.Web.Auth
{
    public class JwtTokenGenerator : IJwtTokenGenerator
    {
        private readonly JwtSettings _settings;

        public JwtTokenGenerator(IOptions<JwtSettings> settings)
        {
            _settings = settings.Value;
        }

        public (string token, DateTime expiresAt) Generate(AuthPrincipal principal)
        {
            var expiresAt = DateTime.UtcNow.AddHours(_settings.ExpiryHours);
            // Primary role = most privileged = lowest id (Admin=1 wins over Medic=2 …).
            var primaryRole = principal.Roles.Length > 0 ? principal.Roles.Min() : 0;

            var claims = new List<Claim>
            {
                new(CareLinkClaims.UserId, principal.UserId.ToString()),
                new(JwtRegisteredClaimNames.Sub, principal.UserId.ToString()),
                new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new(ClaimTypes.Email, principal.Email),
                new(CareLinkClaims.Role, primaryRole.ToString()),
                new(CareLinkClaims.UserType, principal.UserType),
            };

            if (!string.IsNullOrEmpty(principal.Nume))
                claims.Add(new Claim(CareLinkClaims.Nume, principal.Nume));

            // One role claim per held role so [Authorize(Roles = "1,2")] works for multi-role users.
            foreach (var roleId in principal.Roles)
                claims.Add(new Claim(ClaimTypes.Role, roleId.ToString()));

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_settings.Secret));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var jwt = new JwtSecurityToken(
                issuer: _settings.Issuer,
                audience: _settings.Audience,
                claims: claims,
                expires: expiresAt,
                signingCredentials: creds);

            return (new JwtSecurityTokenHandler().WriteToken(jwt), expiresAt);
        }
    }
}
