using Elderlynk.Models;
using Microsoft.EntityFrameworkCore;

namespace Elderlynk.Services
{
    public class MedicalRecommendationService : IMedicalRecommendationService
    {
        private readonly DbContext _context;

        public MedicalRecommendationService(DbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<MedicalRecommendationResponseDto>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            var items = await _context.Set<MedicalRecommendation>()
                .AsNoTracking()
                .ToListAsync(cancellationToken);

            return items.Select(ToDto);
        }

        public async Task<IEnumerable<MedicalRecommendationResponseDto>> GetByPatientIdAsync(int patientId, CancellationToken cancellationToken = default)
        {
            var items = await _context.Set<MedicalRecommendation>()
                .AsNoTracking()
                .Where(r => r.PatientId == patientId)
                .OrderByDescending(r => r.DataRecomandarii)
                .ToListAsync(cancellationToken);

            return items.Select(ToDto);
        }

        public async Task<MedicalRecommendationResponseDto> CreateAsync(CreateMedicalRecommendationDto dto, int doctorId, string? sourceIp, CancellationToken cancellationToken = default)
        {
            // Reuse the medic's most recent consultation for this patient; create one if needed.
            var consultation = await _context.Set<Consultation>()
                .Where(c => c.PatientId == dto.PatientId && c.DoctorId == doctorId)
                .OrderByDescending(c => c.ConsultationDate)
                .FirstOrDefaultAsync(cancellationToken);

            if (consultation == null)
            {
                consultation = new Consultation
                {
                    PatientId = dto.PatientId,
                    DoctorId = doctorId,
                    ConsultationDate = DateTime.Now,
                    PresentationReason = "Recomandare medicală"
                };
                _context.Set<Consultation>().Add(consultation);
                await _context.SaveChangesAsync(cancellationToken);
            }

            var recommendation = new MedicalRecommendation
            {
                PatientId = dto.PatientId,
                ConsultationId = consultation.ConsultationId,
                DataRecomandarii = DateTime.Now,
                TipRecomandare = string.IsNullOrWhiteSpace(dto.TipRecomandare) ? null : dto.TipRecomandare.Trim(),
                Descriere = dto.Descriere.Trim()
            };

            _context.Set<MedicalRecommendation>().Add(recommendation);
            AuditHelper.Add(_context, doctorId, "CREATE_RECOMMENDATION", "Recomandari_Medicale", sourceIp, dto.PatientId,
                $"{(string.IsNullOrWhiteSpace(recommendation.TipRecomandare) ? "Recomandare" : recommendation.TipRecomandare)}: \"{recommendation.Descriere}\"");
            await _context.SaveChangesAsync(cancellationToken);

            return ToDto(recommendation);
        }

        public async Task<bool> UpdateAsync(int id, CreatePatientRecommendationDto dto, int actingUserId, string? sourceIp, CancellationToken cancellationToken = default)
        {
            var rec = await _context.Set<MedicalRecommendation>().FirstOrDefaultAsync(r => r.RecommendationId == id, cancellationToken);
            if (rec == null) return false;
            if (string.IsNullOrWhiteSpace(dto.Descriere)) return false;

            var changes = new List<string?>
            {
                AuditHelper.Diff("Tip", rec.TipRecomandare, dto.TipRecomandare),
                AuditHelper.Diff("Descriere", rec.Descriere, dto.Descriere.Trim()),
            };
            rec.TipRecomandare = string.IsNullOrWhiteSpace(dto.TipRecomandare) ? null : dto.TipRecomandare.Trim();
            rec.Descriere = dto.Descriere.Trim();
            var details = string.Join("; ", changes.Where(c => c != null));
            AuditHelper.Add(_context, actingUserId, "UPDATE_RECOMMENDATION", "Recomandari_Medicale", sourceIp, rec.PatientId,
                string.IsNullOrEmpty(details) ? null : details);
            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }

        public async Task<bool> DeleteAsync(int id, int actingUserId, string? sourceIp, CancellationToken cancellationToken = default)
        {
            var rec = await _context.Set<MedicalRecommendation>().FirstOrDefaultAsync(r => r.RecommendationId == id, cancellationToken);
            if (rec == null) return false;

            _context.Set<MedicalRecommendation>().Remove(rec);
            AuditHelper.Add(_context, actingUserId, "DELETE_RECOMMENDATION", "Recomandari_Medicale", sourceIp, rec.PatientId, $"Recomandare: \"{rec.Descriere}\"");
            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }

        private static MedicalRecommendationResponseDto ToDto(MedicalRecommendation r) => new()
        {
            RecommendationId = r.RecommendationId,
            PatientId = r.PatientId,
            ConsultationId = r.ConsultationId,
            DataRecomandarii = r.DataRecomandarii,
            TipRecomandare = r.TipRecomandare,
            Descriere = r.Descriere
        };
    }
}
