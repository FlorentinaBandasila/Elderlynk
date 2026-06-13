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
                Notes = c.Notes
            });
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
                Notes = consultation.Notes
            };
        }

        public async Task<ConsultationResponseDto> CreateAsync(CreateConsultationDto dto, CancellationToken cancellationToken = default)
        {
            var consultation = new Consultation
            {
                PatientId = dto.PatientId,
                DoctorId = dto.DoctorId,
                ConsultationDate = DateTime.Now,
                PresentationReason = dto.PresentationReason,
                Symptoms = dto.Symptoms,
                DiagnosisCode = dto.DiagnosisCode,
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
            if (dto.PresentationReason != null)
                consultation.PresentationReason = dto.PresentationReason;
            if (dto.Symptoms != null)
                consultation.Symptoms = dto.Symptoms;
            if (dto.DiagnosisCode != null)
                consultation.DiagnosisCode = dto.DiagnosisCode;
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
    }
}
