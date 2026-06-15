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
