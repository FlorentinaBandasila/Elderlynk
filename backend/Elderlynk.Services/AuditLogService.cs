using Elderlynk.Models;
using Microsoft.EntityFrameworkCore;

namespace Elderlynk.Services
{
    public class AuditLogService : IAuditLogService
    {
        private readonly DbContext _context;

        public AuditLogService(DbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<AuditLogResponseDto>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            var logs = await _context.Set<AuditLog>()
                .AsNoTracking()
                .ToListAsync(cancellationToken);

            return logs.Select(l => new AuditLogResponseDto
            {
                LogId = l.LogId,
                UserId = l.UserId,
                Action = l.Action,
                AffectedTable = l.AffectedTable,
                LogDateTime = l.LogDateTime,
                SourceIp = l.SourceIp
            });
        }

        public async Task<AuditLogResponseDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            var log = await _context.Set<AuditLog>()
                .AsNoTracking()
                .FirstOrDefaultAsync(l => l.LogId == id, cancellationToken);

            if (log == null)
                return null;

            return new AuditLogResponseDto
            {
                LogId = log.LogId,
                UserId = log.UserId,
                Action = log.Action,
                AffectedTable = log.AffectedTable,
                LogDateTime = log.LogDateTime,
                SourceIp = log.SourceIp
            };
        }

        public async Task<AuditLogResponseDto> CreateAsync(CreateAuditLogDto dto, CancellationToken cancellationToken = default)
        {
            var log = new AuditLog
            {
                UserId = dto.UserId,
                Action = dto.Action,
                AffectedTable = dto.AffectedTable,
                LogDateTime = DateTime.Now,
                SourceIp = dto.SourceIp
            };

            _context.Set<AuditLog>().Add(log);
            await _context.SaveChangesAsync(cancellationToken);

            return new AuditLogResponseDto
            {
                LogId = log.LogId,
                UserId = log.UserId,
                Action = log.Action,
                AffectedTable = log.AffectedTable,
                LogDateTime = log.LogDateTime,
                SourceIp = log.SourceIp
            };
        }

        public async Task UpdateAsync(int id, UpdateAuditLogDto dto, CancellationToken cancellationToken = default)
        {
            var log = await _context.Set<AuditLog>()
                .FirstOrDefaultAsync(l => l.LogId == id, cancellationToken);

            if (log == null)
                throw new KeyNotFoundException($"Audit log with ID {id} not found.");

            if (dto.UserId.HasValue)
                log.UserId = dto.UserId;
            if (dto.Action != null)
                log.Action = dto.Action;
            if (dto.AffectedTable != null)
                log.AffectedTable = dto.AffectedTable;
            if (dto.SourceIp != null)
                log.SourceIp = dto.SourceIp;

            _context.Set<AuditLog>().Update(log);
            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
        {
            var log = await _context.Set<AuditLog>()
                .FirstOrDefaultAsync(l => l.LogId == id, cancellationToken);

            if (log == null)
                throw new KeyNotFoundException($"Audit log with ID {id} not found.");

            _context.Set<AuditLog>().Remove(log);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
