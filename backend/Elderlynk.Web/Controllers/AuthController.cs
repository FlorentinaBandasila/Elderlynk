using Elderlynk.Models.Auth;
using Elderlynk.Services;
using Elderlynk.Web.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Elderlynk.Web.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _auth;
        private readonly IJwtTokenGenerator _tokens;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IAuthService auth, IJwtTokenGenerator tokens, ILogger<AuthController> logger)
        {
            _auth = auth;
            _tokens = tokens;
            _logger = logger;
        }

        /// <summary>Authenticates against Utilizatori first, then Pacienti. Returns a unified JWT.</summary>
        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginDto dto, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var principal = await _auth.AuthenticateAsync(dto.Email, dto.Parola, cancellationToken);
                if (principal == null)
                    return Unauthorized(new { message = "Email sau parolă incorecte." });

                return Ok(BuildResponse(principal));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during login for {Email}", dto.Email);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>Creates a staff account (Admin/Medic/Supraveghetor). Admin only.</summary>
        [HttpPost("register")]
        [Authorize(Roles = "1")]
        public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterUserDto dto, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var principal = await _auth.RegisterUserAsync(dto, User.GetUserId(), GetSourceIp(), cancellationToken);
                return Ok(BuildResponse(principal));
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error registering user {Email}", dto.Email);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Creates a patient (Pacienti) and an initial consultation linking them to the calling medic.
        /// Medic only. ID_Medic is always taken from the token, never from the request body.
        /// </summary>
        [HttpPost("register-pacient")]
        [Authorize(Roles = "2")]
        public async Task<IActionResult> RegisterPacient([FromBody] RegisterPatientDto dto, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var medicId = User.GetUserId();
                var patientId = await _auth.RegisterPatientAsync(dto, medicId, GetSourceIp(), cancellationToken);
                return CreatedAtAction(null, new { pacientId = patientId });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error registering patient");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>Returns the current user decoded from the token (refreshed from the database).</summary>
        [HttpGet("me")]
        [Authorize]
        public async Task<ActionResult<MeDto>> Me(CancellationToken cancellationToken)
        {
            try
            {
                var principal = await _auth.GetPrincipalAsync(User.GetUserId(), User.GetUserType(), cancellationToken);
                if (principal == null)
                    return NotFound();

                return Ok(new MeDto
                {
                    UserId = principal.UserId,
                    Email = principal.Email,
                    Nume = principal.Nume,
                    Role = (principal.Roles.Length > 0 ? principal.Roles.Min() : 0).ToString(),
                    Roles = principal.Roles,
                    UserType = principal.UserType
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving current user");
                return StatusCode(500, "Internal server error");
            }
        }

        private AuthResponseDto BuildResponse(AuthPrincipal principal)
        {
            var (token, expiresAt) = _tokens.Generate(principal);
            return new AuthResponseDto
            {
                Token = token,
                UserId = principal.UserId,
                Email = principal.Email,
                Nume = principal.Nume,
                Role = (principal.Roles.Length > 0 ? principal.Roles.Min() : 0).ToString(),
                Roles = principal.Roles,
                UserType = principal.UserType,
                ExpiresAt = expiresAt
            };
        }

        private string? GetSourceIp() => HttpContext.Connection.RemoteIpAddress?.ToString();
    }
}
