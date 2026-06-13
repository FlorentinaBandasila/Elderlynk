using Elderlynk.Models;
using Microsoft.EntityFrameworkCore;

namespace Elderlynk.Services
{
    public class RecommendationService : IRecommendationService
    {
        private readonly DbContext _context;

        public RecommendationService(DbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<RecommendationResponseDto>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            var recommendations = await _context.Set<Recommendation>()
                .AsNoTracking()
                .ToListAsync(cancellationToken);

            return recommendations.Select(r => new RecommendationResponseDto
            {
                RecommendationId = r.RecommendationId,
                PatientId = r.PatientId,
                DoctorId = r.DoctorId,
                ActivityType = r.ActivityType,
                DailyDurationMinutes = r.DailyDurationMinutes,
                Description = r.Description,
                StartDate = r.StartDate,
                StopDate = r.StopDate
            });
        }

        public async Task<RecommendationResponseDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            var recommendation = await _context.Set<Recommendation>()
                .AsNoTracking()
                .FirstOrDefaultAsync(r => r.RecommendationId == id, cancellationToken);

            if (recommendation == null)
                return null;

            return new RecommendationResponseDto
            {
                RecommendationId = recommendation.RecommendationId,
                PatientId = recommendation.PatientId,
                DoctorId = recommendation.DoctorId,
                ActivityType = recommendation.ActivityType,
                DailyDurationMinutes = recommendation.DailyDurationMinutes,
                Description = recommendation.Description,
                StartDate = recommendation.StartDate,
                StopDate = recommendation.StopDate
            };
        }

        public async Task<RecommendationResponseDto> CreateAsync(CreateRecommendationDto dto, CancellationToken cancellationToken = default)
        {
            var recommendation = new Recommendation
            {
                PatientId = dto.PatientId,
                DoctorId = dto.DoctorId,
                ActivityType = dto.ActivityType,
                DailyDurationMinutes = dto.DailyDurationMinutes,
                Description = dto.Description,
                StartDate = dto.StartDate,
                StopDate = dto.StopDate
            };

            _context.Set<Recommendation>().Add(recommendation);
            await _context.SaveChangesAsync(cancellationToken);

            return new RecommendationResponseDto
            {
                RecommendationId = recommendation.RecommendationId,
                PatientId = recommendation.PatientId,
                DoctorId = recommendation.DoctorId,
                ActivityType = recommendation.ActivityType,
                DailyDurationMinutes = recommendation.DailyDurationMinutes,
                Description = recommendation.Description,
                StartDate = recommendation.StartDate,
                StopDate = recommendation.StopDate
            };
        }

        public async Task UpdateAsync(int id, UpdateRecommendationDto dto, CancellationToken cancellationToken = default)
        {
            var recommendation = await _context.Set<Recommendation>()
                .FirstOrDefaultAsync(r => r.RecommendationId == id, cancellationToken);

            if (recommendation == null)
                throw new KeyNotFoundException($"Recommendation with ID {id} not found.");

            if (dto.PatientId.HasValue)
                recommendation.PatientId = dto.PatientId;
            if (dto.DoctorId.HasValue)
                recommendation.DoctorId = dto.DoctorId;
            if (dto.ActivityType != null)
                recommendation.ActivityType = dto.ActivityType;
            if (dto.DailyDurationMinutes.HasValue)
                recommendation.DailyDurationMinutes = dto.DailyDurationMinutes;
            if (dto.Description != null)
                recommendation.Description = dto.Description;
            if (dto.StartDate.HasValue)
                recommendation.StartDate = dto.StartDate;
            if (dto.StopDate.HasValue)
                recommendation.StopDate = dto.StopDate;

            _context.Set<Recommendation>().Update(recommendation);
            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
        {
            var recommendation = await _context.Set<Recommendation>()
                .FirstOrDefaultAsync(r => r.RecommendationId == id, cancellationToken);

            if (recommendation == null)
                throw new KeyNotFoundException($"Recommendation with ID {id} not found.");

            _context.Set<Recommendation>().Remove(recommendation);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
