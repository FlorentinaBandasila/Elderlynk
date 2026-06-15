using Elderlynk.Models;
using Microsoft.EntityFrameworkCore;

namespace Elderlynk.Services
{
    public class ConsultationService : IConsultationService
    {
        private readonly DbContext _context;

        public ConsultationService(DbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ConsultationResponseDto>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            var consultations = await _context.Set<Consultation>()
                .AsNoTracking()
                .ToListAsync(cancellationToken);

            var doctorNames = await BuildDoctorNameMapAsync(consultations, cancellationToken);
            return consultations.Select(c => Map(c, doctorNames));
        }

        public async Task<IEnumerable<ConsultationResponseDto>> GetForUserAsync(int userId, int role, CancellationToken cancellationToken = default)
        {
            // Role ids: 1=Admin, 2=Medic, 3=Supraveghetor, 4=Pacient
            IQueryable<Consultation> query = _context.Set<Consultation>().AsNoTracking();

            switch (role)
            {
                case 1: // Admin – all
                    break;
                case 2: // Medic – own consultations
                    query = query.Where(c => c.DoctorId == userId);
                    break;
                case 3: // Supraveghetor – consultations of supervised patients (read-only)
                    query = query.Where(c => _context.Set<Alarm>()
                        .Any(a => a.PatientId == c.PatientId && a.SupervisorId == userId));
                    break;
                case 4: // Pacient – own consultations (userId == ID_Pacient)
                    query = query.Where(c => c.PatientId == userId);
                    break;
                default:
                    return Enumerable.Empty<ConsultationResponseDto>();
            }

            var consultations = await query.ToListAsync(cancellationToken);
            var doctorNames = await BuildDoctorNameMapAsync(consultations, cancellationToken);
            return consultations.Select(c => Map(c, doctorNames));
        }

        public async Task<ConsultationResponseDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            var consultation = await _context.Set<Consultation>()
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.ConsultationId == id, cancellationToken);

            if (consultation == null)
                return null;

            var doctorNames = await BuildDoctorNameMapAsync(new[] { consultation }, cancellationToken);
            return Map(consultation, doctorNames);
        }

        public async Task<ConsultationResponseDto> CreateAsync(CreateConsultationDto dto, CancellationToken cancellationToken = default)
        {
            var consultation = new Consultation
            {
                PatientId = dto.PatientId,
                DoctorId = dto.DoctorId,
                ConsultationDate = dto.ConsultationDate ?? DateTime.Now,
                PresentationReason = dto.PresentationReason,
                Symptoms = dto.Symptoms,
                DiagnosisCode = dto.DiagnosisCode,
                DiagnosticText = dto.DiagnosticText,
                Referrals = dto.Referrals,
                GeneratedPrescriptions = dto.GeneratedPrescriptions,
                Notes = dto.Notes
            };

            _context.Set<Consultation>().Add(consultation);
            await _context.SaveChangesAsync(cancellationToken);

            // Optional medical data captured together with the consultation.
            // Allergies belong to the patient; recommendations and medication schemes
            // are attached to this newly created consultation (ID_Consultatie is NOT NULL).
            if (dto.PatientId.HasValue)
            {
                var patientId = dto.PatientId.Value;

                if (dto.Allergies != null)
                {
                    foreach (var a in dto.Allergies)
                    {
                        if (string.IsNullOrWhiteSpace(a.Denumire)) continue;
                        _context.Set<Allergy>().Add(new Allergy
                        {
                            PatientId = patientId,
                            Denumire = a.Denumire.Trim()
                        });
                    }
                }

                if (dto.Recommendations != null)
                {
                    foreach (var r in dto.Recommendations)
                    {
                        if (string.IsNullOrWhiteSpace(r.Descriere)) continue;
                        _context.Set<MedicalRecommendation>().Add(new MedicalRecommendation
                        {
                            PatientId = patientId,
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
                            PatientId = patientId,
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

                await _context.SaveChangesAsync(cancellationToken);
            }

            var doctorNames = await BuildDoctorNameMapAsync(new[] { consultation }, cancellationToken);
            return Map(consultation, doctorNames);
        }

        public async Task<IEnumerable<MedicalRecommendationResponseDto>> GetRecommendationsAsync(int consultationId, CancellationToken cancellationToken = default)
        {
            var items = await _context.Set<MedicalRecommendation>()
                .AsNoTracking()
                .Where(r => r.ConsultationId == consultationId)
                .OrderByDescending(r => r.DataRecomandarii)
                .ToListAsync(cancellationToken);

            return items.Select(r => new MedicalRecommendationResponseDto
            {
                RecommendationId = r.RecommendationId,
                PatientId = r.PatientId,
                ConsultationId = r.ConsultationId,
                DataRecomandarii = r.DataRecomandarii,
                TipRecomandare = r.TipRecomandare,
                Descriere = r.Descriere
            });
        }

        public async Task<IEnumerable<MedicationSchemeResponseDto>> GetMedicationsAsync(int consultationId, CancellationToken cancellationToken = default)
        {
            var items = await _context.Set<MedicationScheme>()
                .AsNoTracking()
                .Where(m => m.ConsultationId == consultationId)
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

        /// <summary>Resolves ID_Medic -> display name (Nume Prenume) for a set of consultations.</summary>
        private async Task<Dictionary<int, string>> BuildDoctorNameMapAsync(IEnumerable<Consultation> consultations, CancellationToken cancellationToken)
        {
            var ids = consultations
                .Where(c => c.DoctorId.HasValue)
                .Select(c => c.DoctorId!.Value)
                .Distinct()
                .ToList();

            if (ids.Count == 0)
                return new Dictionary<int, string>();

            var users = await _context.Set<User>()
                .AsNoTracking()
                .Where(u => ids.Contains(u.UserId))
                .ToListAsync(cancellationToken);

            return users.ToDictionary(
                u => u.UserId,
                u => string.Join(' ', new[] { u.FirstName, u.LastName }.Where(s => !string.IsNullOrWhiteSpace(s))));
        }

        public async Task UpdateAsync(int id, UpdateConsultationDto dto, CancellationToken cancellationToken = default)
        {
            var consultation = await _context.Set<Consultation>()
                .FirstOrDefaultAsync(c => c.ConsultationId == id, cancellationToken);

            if (consultation == null)
                throw new KeyNotFoundException($"Consultation with ID {id} not found.");

            if (dto.PatientId.HasValue)
                consultation.PatientId = dto.PatientId;
            if (dto.DoctorId.HasValue)
                consultation.DoctorId = dto.DoctorId;
            if (dto.ConsultationDate.HasValue)
                consultation.ConsultationDate = dto.ConsultationDate;
            if (dto.PresentationReason != null)
                consultation.PresentationReason = dto.PresentationReason;
            if (dto.Symptoms != null)
                consultation.Symptoms = dto.Symptoms;
            if (dto.DiagnosisCode != null)
                consultation.DiagnosisCode = dto.DiagnosisCode;
            if (dto.DiagnosticText != null)
                consultation.DiagnosticText = dto.DiagnosticText;
            if (dto.Referrals != null)
                consultation.Referrals = dto.Referrals;
            if (dto.GeneratedPrescriptions != null)
                consultation.GeneratedPrescriptions = dto.GeneratedPrescriptions;
            if (dto.Notes != null)
                consultation.Notes = dto.Notes;

            _context.Set<Consultation>().Update(consultation);
            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
        {
            var consultation = await _context.Set<Consultation>()
                .FirstOrDefaultAsync(c => c.ConsultationId == id, cancellationToken);

            if (consultation == null)
                throw new KeyNotFoundException($"Consultation with ID {id} not found.");

            _context.Set<Consultation>().Remove(consultation);
            await _context.SaveChangesAsync(cancellationToken);
        }

        private static ConsultationResponseDto Map(Consultation c, IReadOnlyDictionary<int, string>? doctorNames = null)
        {
            string? doctorName = null;
            if (c.DoctorId.HasValue && doctorNames != null && doctorNames.TryGetValue(c.DoctorId.Value, out var name))
                doctorName = string.IsNullOrWhiteSpace(name) ? null : name;

            return new ConsultationResponseDto
            {
                ConsultationId = c.ConsultationId,
                PatientId = c.PatientId,
                DoctorId = c.DoctorId,
                DoctorName = doctorName,
                ConsultationDate = c.ConsultationDate,
                PresentationReason = c.PresentationReason,
                Symptoms = c.Symptoms,
                DiagnosisCode = c.DiagnosisCode,
                DiagnosticText = c.DiagnosticText,
                Referrals = c.Referrals,
                GeneratedPrescriptions = c.GeneratedPrescriptions,
                Notes = c.Notes
            };
        }
    }
}
