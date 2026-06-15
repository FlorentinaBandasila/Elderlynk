using Elderlynk.Models;
using Microsoft.EntityFrameworkCore;

namespace Elderlynk.Services
{
    public class PatientService : IPatientService
    {
        // Role ids (Roluri): 1=Admin, 2=Medic, 3=Supraveghetor, 4=Pacient
        private const int RoleAdmin = 1;
        private const int RoleMedic = 2;
        private const int RoleSupervisor = 3;
        private const int RolePatient = 4;

        /// <summary>Default login password assigned to a newly created patient.</summary>
        public const string DefaultPatientPassword = "Pacient123!";

        private readonly DbContext _context;

        public PatientService(DbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<PatientResponseDto>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            var patients = await _context.Set<Patient>()
                .AsNoTracking()
                .ToListAsync(cancellationToken);

            return patients.Select(Map);
        }

        public async Task<IEnumerable<PatientResponseDto>> GetForUserAsync(int userId, int role, CancellationToken cancellationToken = default)
        {
            IQueryable<Patient> query = _context.Set<Patient>().AsNoTracking();

            switch (role)
            {
                case RoleAdmin:
                    break; // all patients

                case RoleMedic:
                    // Patients the medic owns via at least one consultation.
                    query = query.Where(p => _context.Set<Consultation>()
                        .Any(c => c.PatientId == p.PatientId && c.DoctorId == userId));
                    break;

                case RoleSupervisor:
                    // Patients with alarm events assigned to this supervisor.
                    query = query.Where(p => _context.Set<Alarm>()
                        .Any(a => a.PatientId == p.PatientId && a.SupervisorId == userId));
                    break;

                case RolePatient:
                    query = query.Where(p => p.PatientId == userId);
                    break;

                default:
                    return Enumerable.Empty<PatientResponseDto>();
            }

            var patients = await query.ToListAsync(cancellationToken);
            return patients.Select(Map);
        }

        public async Task<PatientResponseDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            var patient = await _context.Set<Patient>()
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.PatientId == id, cancellationToken);

            return patient == null ? null : Map(patient);
        }

        public async Task<PatientResponseDto> CreateAsync(CreatePatientDto dto, int? linkMedicId, int actingUserId, string? sourceIp, CancellationToken cancellationToken = default)
        {
            var patient = new Patient
            {
                LastName = dto.LastName,
                FirstName = dto.FirstName,
                CNP = dto.CNP,
                Street = dto.Street,
                City = dto.City,
                County = dto.County,
                PostalCode = dto.PostalCode,
                Phone = dto.Phone,
                Email = dto.Email,
                Profession = dto.Profession,
                WorkPlace = dto.WorkPlace,
                // Parola_Hash is NOT NULL in the DB. New patients get a default password
                // (DefaultPatientPassword) which they can change later; stored as a BCrypt hash.
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(DefaultPatientPassword),
                Active = true,
                DateAdded = DateTime.UtcNow
            };

            _context.Set<Patient>().Add(patient);
            await _context.SaveChangesAsync(cancellationToken);

            // Allergies and medical history link directly to the patient.
            if (dto.Allergies != null)
            {
                foreach (var a in dto.Allergies)
                {
                    if (string.IsNullOrWhiteSpace(a.Denumire)) continue;
                    _context.Set<Allergy>().Add(new Allergy
                    {
                        PatientId = patient.PatientId,
                        Denumire = a.Denumire.Trim()
                    });
                }
            }

            if (dto.MedicalHistory != null)
            {
                foreach (var h in dto.MedicalHistory)
                {
                    if (string.IsNullOrWhiteSpace(h.Diagnostic)) continue;
                    _context.Set<MedicalHistory>().Add(new MedicalHistory
                    {
                        PatientId = patient.PatientId,
                        Diagnostic = h.Diagnostic.Trim(),
                        Tratament = string.IsNullOrWhiteSpace(h.Tratament) ? null : h.Tratament.Trim(),
                        DataDiagnostic = h.DataDiagnostic,
                        Observatii = string.IsNullOrWhiteSpace(h.Observatii) ? null : h.Observatii.Trim()
                    });
                }
            }

            // Recommendations and medication schemes require a consultation (ID_Consultatie
            // is NOT NULL), so they are only persisted when the patient is linked to a medic.
            if (linkMedicId.HasValue)
            {
                var consultation = new Consultation
                {
                    PatientId = patient.PatientId,
                    DoctorId = linkMedicId.Value,
                    ConsultationDate = DateTime.Now,
                    PresentationReason = "Înregistrare pacient"
                };
                _context.Set<Consultation>().Add(consultation);
                await _context.SaveChangesAsync(cancellationToken);

                if (dto.Recommendations != null)
                {
                    foreach (var r in dto.Recommendations)
                    {
                        if (string.IsNullOrWhiteSpace(r.Descriere)) continue;
                        _context.Set<MedicalRecommendation>().Add(new MedicalRecommendation
                        {
                            PatientId = patient.PatientId,
                            ConsultationId = consultation.ConsultationId,
                            DataRecomandarii = DateTime.Now,
                            TipRecomandare = string.IsNullOrWhiteSpace(r.TipRecomandare) ? null : r.TipRecomandare.Trim(),
                            Descriere = r.Descriere.Trim()
                        });
                    }
                }

                if (dto.Medications != null)
                {
                    foreach (var m in dto.Medications)
                    {
                        if (string.IsNullOrWhiteSpace(m.DenumireMedicament) || string.IsNullOrWhiteSpace(m.Doza)) continue;
                        _context.Set<MedicationScheme>().Add(new MedicationScheme
                        {
                            PatientId = patient.PatientId,
                            ConsultationId = consultation.ConsultationId,
                            DenumireMedicament = m.DenumireMedicament.Trim(),
                            Doza = m.Doza.Trim(),
                            // Frecventa_Administrare is NOT NULL in the DB; store "" when not supplied.
                            FrecventaAdministrare = m.FrecventaAdministrare?.Trim() ?? string.Empty,
                            DurataTratament = string.IsNullOrWhiteSpace(m.DurataTratament) ? null : m.DurataTratament.Trim(),
                            DataPrescriere = DateTime.Now,
                            ObservatiiIngrijitor = string.IsNullOrWhiteSpace(m.ObservatiiIngrijitor) ? null : m.ObservatiiIngrijitor.Trim()
                        });
                    }
                }
            }

            AuditHelper.Add(_context, actingUserId, "CREATE_PATIENT", "Pacienti", sourceIp);
            await _context.SaveChangesAsync(cancellationToken);

            return Map(patient);
        }

        public async Task<IEnumerable<AllergyResponseDto>> GetAllergiesAsync(int patientId, CancellationToken cancellationToken = default)
        {
            var items = await _context.Set<Allergy>()
                .AsNoTracking()
                .Where(a => a.PatientId == patientId)
                .ToListAsync(cancellationToken);

            return items.Select(a => new AllergyResponseDto
            {
                AllergyId = a.AllergyId,
                PatientId = a.PatientId,
                Denumire = a.Denumire
            });
        }

        public async Task<IEnumerable<MedicalHistoryResponseDto>> GetHistoryAsync(int patientId, CancellationToken cancellationToken = default)
        {
            var items = await _context.Set<MedicalHistory>()
                .AsNoTracking()
                .Where(h => h.PatientId == patientId)
                .OrderByDescending(h => h.DataDiagnostic)
                .ToListAsync(cancellationToken);

            return items.Select(h => new MedicalHistoryResponseDto
            {
                HistoryId = h.HistoryId,
                PatientId = h.PatientId,
                Diagnostic = h.Diagnostic,
                Tratament = h.Tratament,
                DataDiagnostic = h.DataDiagnostic,
                Observatii = h.Observatii
            });
        }

        public async Task<IEnumerable<MedicationSchemeResponseDto>> GetMedicationsAsync(int patientId, CancellationToken cancellationToken = default)
        {
            var items = await _context.Set<MedicationScheme>()
                .AsNoTracking()
                .Where(m => m.PatientId == patientId)
                .OrderByDescending(m => m.DataPrescriere)
                .ToListAsync(cancellationToken);

            return items.Select(m => new MedicationSchemeResponseDto
            {
                MedicationId = m.MedicationId,
                PatientId = m.PatientId,
                ConsultationId = m.ConsultationId,
                DenumireMedicament = m.DenumireMedicament,
                Doza = m.Doza,
                FrecventaAdministrare = m.FrecventaAdministrare,
                DurataTratament = m.DurataTratament,
                DataPrescriere = m.DataPrescriere,
                ObservatiiIngrijitor = m.ObservatiiIngrijitor
            });
        }

        private static PatientResponseDto Map(Patient p) => new()
        {
            PatientId = p.PatientId,
            LastName = p.LastName,
            FirstName = p.FirstName,
            CNP = p.CNP,
            Street = p.Street,
            City = p.City,
            County = p.County,
            PostalCode = p.PostalCode,
            Phone = p.Phone,
            Email = p.Email,
            Profession = p.Profession,
            WorkPlace = p.WorkPlace,
            DateAdded = p.DateAdded,
            LastModified = p.LastModified,
            Active = p.Active
        };
    }
}
