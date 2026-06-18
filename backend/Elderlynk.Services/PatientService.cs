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
        private const int RoleCaregiver = 5;

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
                .Where(p => p.Active)
                .ToListAsync(cancellationToken);

            return await MapManyAsync(patients, cancellationToken);
        }

        /// <summary>Lists the active accounts that can be assigned to a patient as caregivers (ID_Rol = 5).</summary>
        public async Task<IEnumerable<UserResponseDto>> GetCaregiversAsync(CancellationToken cancellationToken = default)
        {
            var caregivers = await _context.Set<User>()
                .AsNoTracking()
                .Where(u => u.RoleId == RoleCaregiver && (u.Active == null || u.Active == true))
                .OrderBy(u => u.LastName).ThenBy(u => u.FirstName)
                .ToListAsync(cancellationToken);

            return caregivers.Select(u => new UserResponseDto
            {
                UserId = u.UserId,
                Email = u.Email,
                FirstName = u.FirstName,
                LastName = u.LastName,
                Phone = u.Phone,
                CreatedDate = u.CreatedDate,
                Active = u.Active
            });
        }

        public async Task<IEnumerable<PatientResponseDto>> GetForUserAsync(int userId, int role, CancellationToken cancellationToken = default)
        {
            IQueryable<Patient> query = _context.Set<Patient>().AsNoTracking().Where(p => p.Active);

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
            return await MapManyAsync(patients, cancellationToken);
        }

        public async Task<PatientResponseDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            var patient = await _context.Set<Patient>()
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.PatientId == id, cancellationToken);

            if (patient == null) return null;
            var dto = Map(patient);
            dto.CaregiverName = await GetCaregiverNameAsync(patient.CaregiverId, cancellationToken);
            return dto;
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
                CaregiverId = dto.CaregiverId,
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

            var createdName = string.Join(" ", new[] { patient.FirstName, patient.LastName }.Where(s => !string.IsNullOrWhiteSpace(s)));
            AuditHelper.Add(_context, actingUserId, "CREATE_PATIENT", "Pacienti", sourceIp, patient.PatientId,
                string.IsNullOrWhiteSpace(createdName) ? $"CNP: {patient.CNP}" : $"Pacient: {createdName}");
            await _context.SaveChangesAsync(cancellationToken);

            var created = Map(patient);
            created.CaregiverName = await GetCaregiverNameAsync(patient.CaregiverId, cancellationToken);
            return created;
        }

        public async Task<PatientResponseDto?> UpdateAsync(int id, UpdatePatientDto dto, int actingUserId, string? sourceIp, CancellationToken cancellationToken = default)
        {
            var patient = await _context.Set<Patient>()
                .FirstOrDefaultAsync(p => p.PatientId == id, cancellationToken);
            if (patient == null)
                return null;

            var changes = new List<string?>();
            if (dto.LastName != null) { changes.Add(AuditHelper.Diff("Nume", patient.LastName, dto.LastName)); patient.LastName = dto.LastName; }
            if (dto.FirstName != null) { changes.Add(AuditHelper.Diff("Prenume", patient.FirstName, dto.FirstName)); patient.FirstName = dto.FirstName; }
            if (!string.IsNullOrWhiteSpace(dto.CNP)) { changes.Add(AuditHelper.Diff("CNP", patient.CNP, dto.CNP)); patient.CNP = dto.CNP; }
            if (dto.Street != null) { changes.Add(AuditHelper.Diff("Stradă", patient.Street, dto.Street)); patient.Street = dto.Street; }
            if (dto.City != null) { changes.Add(AuditHelper.Diff("Oraș", patient.City, dto.City)); patient.City = dto.City; }
            if (dto.County != null) { changes.Add(AuditHelper.Diff("Județ", patient.County, dto.County)); patient.County = dto.County; }
            if (dto.PostalCode != null) { changes.Add(AuditHelper.Diff("Cod poștal", patient.PostalCode, dto.PostalCode)); patient.PostalCode = dto.PostalCode; }
            if (dto.Phone != null) { changes.Add(AuditHelper.Diff("Telefon", patient.Phone, dto.Phone)); patient.Phone = dto.Phone; }
            if (dto.Email != null) { changes.Add(AuditHelper.Diff("Email", patient.Email, dto.Email)); patient.Email = dto.Email; }
            if (dto.Profession != null) { changes.Add(AuditHelper.Diff("Profesie", patient.Profession, dto.Profession)); patient.Profession = dto.Profession; }
            if (dto.WorkPlace != null) { changes.Add(AuditHelper.Diff("Loc de muncă", patient.WorkPlace, dto.WorkPlace)); patient.WorkPlace = dto.WorkPlace; }
            if (dto.CaregiverId.HasValue) { changes.Add(AuditHelper.Diff("Îngrijitor", patient.CaregiverId?.ToString(), dto.CaregiverId.ToString())); patient.CaregiverId = dto.CaregiverId; }
            patient.LastModified = DateTime.UtcNow;

            var details = string.Join("; ", changes.Where(c => c != null));
            AuditHelper.Add(_context, actingUserId, "UPDATE_PATIENT", "Pacienti", sourceIp, patient.PatientId,
                string.IsNullOrEmpty(details) ? null : details);
            await _context.SaveChangesAsync(cancellationToken);
            var updated = Map(patient);
            updated.CaregiverName = await GetCaregiverNameAsync(patient.CaregiverId, cancellationToken);
            return updated;
        }

        public async Task<bool> DeleteAsync(int id, int actingUserId, string? sourceIp, CancellationToken cancellationToken = default)
        {
            var patient = await _context.Set<Patient>()
                .FirstOrDefaultAsync(p => p.PatientId == id, cancellationToken);
            if (patient == null)
                return false;

            // Soft delete: patients are referenced by consultations/medical data, so we
            // deactivate rather than hard-delete to avoid FK violations.
            patient.Active = false;
            patient.LastModified = DateTime.UtcNow;

            var name = string.Join(" ", new[] { patient.FirstName, patient.LastName }.Where(s => !string.IsNullOrWhiteSpace(s)));
            AuditHelper.Add(_context, actingUserId, "DELETE_PATIENT", "Pacienti", sourceIp, patient.PatientId,
                string.IsNullOrWhiteSpace(name) ? null : $"Pacient: {name}");
            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }

        // ===== Allergies =====
        public async Task<bool> UpdateAllergyAsync(int allergyId, CreateAllergyDto dto, int actingUserId, string? sourceIp, CancellationToken cancellationToken = default)
        {
            var allergy = await _context.Set<Allergy>().FirstOrDefaultAsync(a => a.AllergyId == allergyId, cancellationToken);
            if (allergy == null) return false;
            if (string.IsNullOrWhiteSpace(dto.Denumire)) return false;

            var detail = AuditHelper.Diff("Alergie", allergy.Denumire, dto.Denumire.Trim());
            allergy.Denumire = dto.Denumire.Trim();
            AuditHelper.Add(_context, actingUserId, "UPDATE_ALLERGY", "Alergii", sourceIp, allergy.PatientId, detail);
            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }

        public async Task<bool> DeleteAllergyAsync(int allergyId, int actingUserId, string? sourceIp, CancellationToken cancellationToken = default)
        {
            var allergy = await _context.Set<Allergy>().FirstOrDefaultAsync(a => a.AllergyId == allergyId, cancellationToken);
            if (allergy == null) return false;

            _context.Set<Allergy>().Remove(allergy);
            AuditHelper.Add(_context, actingUserId, "DELETE_ALLERGY", "Alergii", sourceIp, allergy.PatientId, $"Alergie: \"{allergy.Denumire}\"");
            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }

        // ===== Medical history =====
        public async Task<bool> UpdateHistoryAsync(int historyId, CreateMedicalHistoryDto dto, int actingUserId, string? sourceIp, CancellationToken cancellationToken = default)
        {
            var history = await _context.Set<MedicalHistory>().FirstOrDefaultAsync(h => h.HistoryId == historyId, cancellationToken);
            if (history == null) return false;
            if (string.IsNullOrWhiteSpace(dto.Diagnostic)) return false;

            var changes = new List<string?>
            {
                AuditHelper.Diff("Diagnostic", history.Diagnostic, dto.Diagnostic.Trim()),
                AuditHelper.Diff("Tratament", history.Tratament, dto.Tratament),
                AuditHelper.Diff("Observații", history.Observatii, dto.Observatii),
            };
            history.Diagnostic = dto.Diagnostic.Trim();
            history.Tratament = string.IsNullOrWhiteSpace(dto.Tratament) ? null : dto.Tratament.Trim();
            history.DataDiagnostic = dto.DataDiagnostic;
            history.Observatii = string.IsNullOrWhiteSpace(dto.Observatii) ? null : dto.Observatii.Trim();
            var details = string.Join("; ", changes.Where(c => c != null));
            AuditHelper.Add(_context, actingUserId, "UPDATE_HISTORY", "Istoric_Medical", sourceIp, history.PatientId,
                string.IsNullOrEmpty(details) ? null : details);
            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }

        public async Task<bool> DeleteHistoryAsync(int historyId, int actingUserId, string? sourceIp, CancellationToken cancellationToken = default)
        {
            var history = await _context.Set<MedicalHistory>().FirstOrDefaultAsync(h => h.HistoryId == historyId, cancellationToken);
            if (history == null) return false;

            _context.Set<MedicalHistory>().Remove(history);
            AuditHelper.Add(_context, actingUserId, "DELETE_HISTORY", "Istoric_Medical", sourceIp, history.PatientId, $"Diagnostic: \"{history.Diagnostic}\"");
            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }

        // ===== Medication schemes =====
        public async Task<bool> UpdateMedicationAsync(int medicationId, CreateMedicationSchemeDto dto, int actingUserId, string? sourceIp, CancellationToken cancellationToken = default)
        {
            var med = await _context.Set<MedicationScheme>().FirstOrDefaultAsync(m => m.MedicationId == medicationId, cancellationToken);
            if (med == null) return false;
            if (string.IsNullOrWhiteSpace(dto.DenumireMedicament) || string.IsNullOrWhiteSpace(dto.Doza)) return false;

            var changes = new List<string?>
            {
                AuditHelper.Diff("Medicament", med.DenumireMedicament, dto.DenumireMedicament.Trim()),
                AuditHelper.Diff("Doză", med.Doza, dto.Doza.Trim()),
                AuditHelper.Diff("Frecvență", med.FrecventaAdministrare, dto.FrecventaAdministrare),
                AuditHelper.Diff("Durată", med.DurataTratament, dto.DurataTratament),
                AuditHelper.Diff("Observații", med.ObservatiiIngrijitor, dto.ObservatiiIngrijitor),
            };
            med.DenumireMedicament = dto.DenumireMedicament.Trim();
            med.Doza = dto.Doza.Trim();
            med.FrecventaAdministrare = dto.FrecventaAdministrare?.Trim() ?? string.Empty;
            med.DurataTratament = string.IsNullOrWhiteSpace(dto.DurataTratament) ? null : dto.DurataTratament.Trim();
            med.ObservatiiIngrijitor = string.IsNullOrWhiteSpace(dto.ObservatiiIngrijitor) ? null : dto.ObservatiiIngrijitor.Trim();
            var details = string.Join("; ", changes.Where(c => c != null));
            AuditHelper.Add(_context, actingUserId, "UPDATE_MEDICATION", "Scheme_Medicatie", sourceIp, med.PatientId,
                string.IsNullOrEmpty(details) ? null : details);
            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }

        public async Task<bool> DeleteMedicationAsync(int medicationId, int actingUserId, string? sourceIp, CancellationToken cancellationToken = default)
        {
            var med = await _context.Set<MedicationScheme>().FirstOrDefaultAsync(m => m.MedicationId == medicationId, cancellationToken);
            if (med == null) return false;

            _context.Set<MedicationScheme>().Remove(med);
            AuditHelper.Add(_context, actingUserId, "DELETE_MEDICATION", "Scheme_Medicatie", sourceIp, med.PatientId, $"Medicament: \"{med.DenumireMedicament}\"");
            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }

        // ===== Activity (audit log scoped to a patient) =====
        public async Task<IEnumerable<AuditLogResponseDto>> GetActivityAsync(int patientId, CancellationToken cancellationToken = default)
        {
            // Authentication events (LOGIN/LOGOUT) are account-level, not patient care
            // activity, so they are excluded from a patient's activity feed.
            var logs = await _context.Set<AuditLog>()
                .AsNoTracking()
                .Where(l => l.PatientId == patientId && l.Action != "LOGIN" && l.Action != "LOGOUT")
                .OrderByDescending(l => l.LogDateTime)
                .Take(50)
                .ToListAsync(cancellationToken);

            var userIds = logs.Where(l => l.UserId.HasValue).Select(l => l.UserId!.Value).Distinct().ToList();
            var users = await _context.Set<User>()
                .AsNoTracking()
                .Where(u => userIds.Contains(u.UserId))
                .ToListAsync(cancellationToken);
            var names = users.ToDictionary(
                u => u.UserId,
                u => string.Join(' ', new[] { u.FirstName, u.LastName }.Where(s => !string.IsNullOrWhiteSpace(s))));

            return logs.Select(l => new AuditLogResponseDto
            {
                LogId = l.LogId,
                UserId = l.UserId,
                PatientId = l.PatientId,
                UserName = l.UserId.HasValue && names.TryGetValue(l.UserId.Value, out var n) && !string.IsNullOrWhiteSpace(n) ? n : null,
                Action = l.Action,
                AffectedTable = l.AffectedTable,
                LogDateTime = l.LogDateTime,
                SourceIp = l.SourceIp,
                Details = l.Details
            });
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

        public async Task<IEnumerable<PatientMeasurementDto>> GetMeasurementsAsync(
            int patientId, DateTimeOffset? from, DateTimeOffset? to, int? limit = null, CancellationToken cancellationToken = default)
        {
            // Resolve the patient's sensors: Device(ID_Pacient) -> SensorConfig(ID_Dispozitiv).
            var sensors = await (
                from s in _context.Set<SensorConfig>().AsNoTracking()
                join d in _context.Set<Device>().AsNoTracking() on s.DeviceId equals d.DeviceId
                where d.PatientId == patientId
                select s
            ).ToListAsync(cancellationToken);

            if (sensors.Count == 0)
                return Enumerable.Empty<PatientMeasurementDto>();

            var sensorIds = sensors.Select(s => s.SensorId).ToList();
            var meta = sensors.ToDictionary(s => s.SensorId);

            var query = _context.Set<SensorMeasurement>().AsNoTracking()
                .Where(m => m.SensorId.HasValue && sensorIds.Contains(m.SensorId.Value));

            if (from.HasValue) query = query.Where(m => m.MeasurementDateTime >= from.Value);
            if (to.HasValue) query = query.Where(m => m.MeasurementDateTime <= to.Value);

            List<SensorMeasurement> measurements;
            if (limit.HasValue && limit.Value > 0)
            {
                // Polling path: fetch only the most recent N rows (descending), then
                // flip to ascending so the client can append them to the chart.
                measurements = await query
                    .OrderByDescending(m => m.MeasurementDateTime)
                    .Take(limit.Value)
                    .ToListAsync(cancellationToken);
                measurements.Reverse();
            }
            else
            {
                measurements = await query
                    .OrderBy(m => m.MeasurementDateTime)
                    .ToListAsync(cancellationToken);
            }

            return measurements.Select(m =>
            {
                meta.TryGetValue(m.SensorId!.Value, out var s);
                return new PatientMeasurementDto
                {
                    MeasurementId = m.MeasurementId,
                    SensorId = m.SensorId.Value,
                    SensorType = s?.SensorType,
                    MeasurementUnit = s?.MeasurementUnit,
                    Value = m.Value,
                    MeasurementDateTime = m.MeasurementDateTime,
                    LowerAlarmThreshold = s?.LowerAlarmThreshold,
                    LowerWarningThreshold = s?.LowerWarningThreshold,
                    UpperWarningThreshold = s?.UpperWarningThreshold,
                    UpperAlarmThreshold = s?.UpperAlarmThreshold,
                };
            });
        }

        public async Task<IEnumerable<ManualMeasurementResponseDto>> GetManualMeasurementsAsync(
            int patientId, CancellationToken cancellationToken = default)
        {
            return await _context.Set<ManualMeasurement>().AsNoTracking()
                .Where(m => m.PatientId == patientId)
                .OrderByDescending(m => m.RecordedAt)
                .Select(m => new ManualMeasurementResponseDto
                {
                    MeasurementId = m.MeasurementId,
                    PatientId = m.PatientId,
                    SourceUserId = m.SourceUserId,
                    TensiuneSistolica = m.TensiuneSistolica,
                    TensiuneDiastolica = m.TensiuneDiastolica,
                    Glicemie = m.Glicemie,
                    Greutate = m.Greutate,
                    Temperatura = m.Temperatura,
                    RecordedAt = m.RecordedAt,
                    Observatii = m.Observatii
                })
                .ToListAsync(cancellationToken);
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
            CaregiverId = p.CaregiverId,
            DateAdded = p.DateAdded,
            LastModified = p.LastModified,
            Active = p.Active
        };

        /// <summary>Maps a batch of patients, resolving caregiver names in a single query.</summary>
        private async Task<IEnumerable<PatientResponseDto>> MapManyAsync(List<Patient> patients, CancellationToken cancellationToken)
        {
            var dtos = patients.Select(Map).ToList();

            var caregiverIds = patients.Where(p => p.CaregiverId.HasValue)
                .Select(p => p.CaregiverId!.Value).Distinct().ToList();
            if (caregiverIds.Count == 0)
                return dtos;

            var names = await _context.Set<User>()
                .AsNoTracking()
                .Where(u => caregiverIds.Contains(u.UserId))
                .ToDictionaryAsync(u => u.UserId, FullName, cancellationToken);

            foreach (var dto in dtos)
            {
                if (dto.CaregiverId.HasValue && names.TryGetValue(dto.CaregiverId.Value, out var n))
                    dto.CaregiverName = n;
            }
            return dtos;
        }

        private async Task<string?> GetCaregiverNameAsync(int? caregiverId, CancellationToken cancellationToken)
        {
            if (!caregiverId.HasValue) return null;
            var user = await _context.Set<User>()
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.UserId == caregiverId.Value, cancellationToken);
            return user == null ? null : FullName(user);
        }

        private static string FullName(User u) =>
            string.Join(' ', new[] { u.FirstName, u.LastName }.Where(s => !string.IsNullOrWhiteSpace(s)));
    }
}
