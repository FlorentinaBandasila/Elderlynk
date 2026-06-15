using Elderlynk.Models;
using Elderlynk.Models.Auth;
using Microsoft.EntityFrameworkCore;

namespace Elderlynk.Services
{
    public class AuthService : IAuthService
    {
        public const int PatientRoleId = 4;

        private readonly DbContext _context;

        public AuthService(DbContext context)
        {
            _context = context;
        }

        public async Task<AuthPrincipal?> AuthenticateAsync(string email, string parola, CancellationToken cancellationToken = default)
        {
            // 1) Staff accounts (Utilizatori) take precedence.
            var user = await _context.Set<User>()
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Email == email, cancellationToken);

            if (user != null)
            {
                if ((user.Active ?? true) && Verify(parola, user.PasswordHash))
                {
                    return new AuthPrincipal
                    {
                        UserId = user.UserId,
                        Email = user.Email,
                        Nume = BuildName(user.FirstName, user.LastName),
                        Roles = RolesOf(user),
                        UserType = "user"
                    };
                }
                return null;
            }

            // 2) Patients authenticate against Pacienti (Email + Parola_Hash).
            var patient = await _context.Set<Patient>()
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.Email == email, cancellationToken);

            if (patient != null && patient.Active && !string.IsNullOrEmpty(patient.PasswordHash)
                && Verify(parola, patient.PasswordHash!))
            {
                return new AuthPrincipal
                {
                    UserId = patient.PatientId,
                    Email = patient.Email!,
                    Nume = BuildName(patient.FirstName, patient.LastName),
                    Roles = new[] { PatientRoleId },
                    UserType = "patient"
                };
            }

            return null;
        }

        public async Task<AuthPrincipal> RegisterUserAsync(RegisterUserDto dto, int? actingUserId, string? sourceIp, CancellationToken cancellationToken = default)
        {
            var exists = await _context.Set<User>()
                .AnyAsync(u => u.Email == dto.Email, cancellationToken);
            if (exists)
                throw new InvalidOperationException($"An account with email '{dto.Email}' already exists.");

            var user = new User
            {
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Parola),
                FirstName = dto.Nume,
                LastName = dto.Prenume,
                Phone = dto.Telefon,
                RoleId = dto.RoleId,
                CreatedDate = DateTimeOffset.UtcNow,
                Active = true
            };

            _context.Set<User>().Add(user);
            await _context.SaveChangesAsync(cancellationToken);

            AuditHelper.Add(_context, actingUserId ?? user.UserId, "REGISTER_USER", "Utilizatori", sourceIp);
            await _context.SaveChangesAsync(cancellationToken);

            return new AuthPrincipal
            {
                UserId = user.UserId,
                Email = user.Email,
                Nume = BuildName(user.FirstName, user.LastName),
                Roles = RolesOf(user),
                UserType = "user"
            };
        }

        public async Task<int> RegisterPatientAsync(RegisterPatientDto dto, int medicUserId, string? sourceIp, CancellationToken cancellationToken = default)
        {
            if (!string.IsNullOrWhiteSpace(dto.Email))
            {
                var emailTaken = await _context.Set<Patient>()
                    .AnyAsync(p => p.Email == dto.Email, cancellationToken);
                if (emailTaken)
                    throw new InvalidOperationException($"A patient with email '{dto.Email}' already exists.");
            }

            var patient = new Patient
            {
                LastName = dto.LastName,
                FirstName = dto.FirstName,
                CNP = dto.CNP,
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Parola),
                Street = dto.Street,
                City = dto.City,
                County = dto.County,
                PostalCode = dto.PostalCode,
                Phone = dto.Phone,
                Profession = dto.Profession,
                WorkPlace = dto.WorkPlace,
                Active = true,
                DateAdded = DateTime.UtcNow
            };

            _context.Set<Patient>().Add(patient);
            await _context.SaveChangesAsync(cancellationToken);

            // Ownership of a patient by a medic is expressed through Consultatii.
            _context.Set<Consultation>().Add(new Consultation
            {
                PatientId = patient.PatientId,
                DoctorId = medicUserId,
                ConsultationDate = DateTime.Now,
                PresentationReason = dto.PresentationReason ?? "Înregistrare pacient"
            });
            AuditHelper.Add(_context, medicUserId, "REGISTER_PATIENT", "Pacienti", sourceIp, patient.PatientId);
            await _context.SaveChangesAsync(cancellationToken);

            return patient.PatientId;
        }

        public async Task<AuthPrincipal?> GetPrincipalAsync(int userId, string userType, CancellationToken cancellationToken = default)
        {
            if (userType == "patient")
            {
                var patient = await _context.Set<Patient>()
                    .AsNoTracking()
                    .FirstOrDefaultAsync(p => p.PatientId == userId, cancellationToken);
                if (patient == null)
                    return null;

                return new AuthPrincipal
                {
                    UserId = patient.PatientId,
                    Email = patient.Email ?? string.Empty,
                    Nume = BuildName(patient.FirstName, patient.LastName),
                    Roles = new[] { PatientRoleId },
                    UserType = "patient"
                };
            }

            var user = await _context.Set<User>()
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.UserId == userId, cancellationToken);
            if (user == null)
                return null;

            return new AuthPrincipal
            {
                UserId = user.UserId,
                Email = user.Email,
                Nume = BuildName(user.FirstName, user.LastName),
                Roles = RolesOf(user),
                UserType = "user"
            };
        }

        /// <summary>A staff account carries a single role via Utilizatori.ID_Rol.</summary>
        private static int[] RolesOf(User user) =>
            user.RoleId.HasValue ? new[] { user.RoleId.Value } : Array.Empty<int>();

        private static bool Verify(string parola, string hash)
        {
            try
            {
                return BCrypt.Net.BCrypt.Verify(parola, hash);
            }
            catch
            {
                // Malformed/legacy hash – treat as failed verification rather than throwing.
                return false;
            }
        }

        private static string? BuildName(string? first, string? last)
        {
            var name = $"{first} {last}".Trim();
            return string.IsNullOrEmpty(name) ? null : name;
        }
    }
}
