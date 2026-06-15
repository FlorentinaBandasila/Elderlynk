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

            return consultations.Select(c => new ConsultationResponseDto
            {
                ConsultationId = c.ConsultationId,
                PatientId = c.PatientId,
                DoctorId = c.DoctorId,
                ConsultationDate = c.ConsultationDate,
                PresentationReason = c.PresentationReason,
                Symptoms = c.Symptoms,
                DiagnosisCode = c.DiagnosisCode,
                DiagnosticText = c.DiagnosticText,
                Referrals = c.Referrals,
                GeneratedPrescriptions = c.GeneratedPrescriptions,
                Notes = c.Notes
            });
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
            return consultations.Select(Map);
        }

        public async Task<ConsultationResponseDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            var consultation = await _context.Set<Consultation>()
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.ConsultationId == id, cancellationToken);

            if (consultation == null)
                return null;

            return new ConsultationResponseDto
            {
                ConsultationId = consultation.ConsultationId,
                PatientId = consultation.PatientId,
                DoctorId = consultation.DoctorId,
                ConsultationDate = consultation.ConsultationDate,
                PresentationReason = consultation.PresentationReason,
                Symptoms = consultation.Symptoms,
                DiagnosisCode = consultation.DiagnosisCode,
                DiagnosticText = consultation.DiagnosticText,
                Referrals = consultation.Referrals,
                GeneratedPrescriptions = consultation.GeneratedPrescriptions,
                Notes = consultation.Notes
            };
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

            return new ConsultationResponseDto
            {
                ConsultationId = consultation.ConsultationId,
                PatientId = consultation.PatientId,
                DoctorId = consultation.DoctorId,
                ConsultationDate = consultation.ConsultationDate,
                PresentationReason = consultation.PresentationReason,
                Symptoms = consultation.Symptoms,
                DiagnosisCode = consultation.DiagnosisCode,
                DiagnosticText = consultation.DiagnosticText,
                Referrals = consultation.Referrals,
                GeneratedPrescriptions = consultation.GeneratedPrescriptions,
                Notes = consultation.Notes
            };
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

        private static ConsultationResponseDto Map(Consultation c) => new()
        {
            ConsultationId = c.ConsultationId,
            PatientId = c.PatientId,
            DoctorId = c.DoctorId,
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
