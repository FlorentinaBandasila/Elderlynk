using Elderlynk.Models;
using Microsoft.EntityFrameworkCore;

namespace Elderlynk.Services
{
    public class HL7MessageService : IHL7MessageService
    {
        private readonly DbContext _context;

        public HL7MessageService(DbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<HL7MessageResponseDto>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            var messages = await _context.Set<HL7Message>()
                .AsNoTracking()
                .ToListAsync(cancellationToken);

            return messages.Select(m => new HL7MessageResponseDto
            {
                MessageId = m.MessageId,
                PatientId = m.PatientId,
                Direction = m.Direction,
                Content = m.Content,
                TransferDate = m.TransferDate
            });
        }

        public async Task<HL7MessageResponseDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            var message = await _context.Set<HL7Message>()
                .AsNoTracking()
                .FirstOrDefaultAsync(m => m.MessageId == id, cancellationToken);

            if (message == null)
                return null;

            return new HL7MessageResponseDto
            {
                MessageId = message.MessageId,
                PatientId = message.PatientId,
                Direction = message.Direction,
                Content = message.Content,
                TransferDate = message.TransferDate
            };
        }

        public async Task<HL7MessageResponseDto> CreateAsync(CreateHL7MessageDto dto, CancellationToken cancellationToken = default)
        {
            var message = new HL7Message
            {
                PatientId = dto.PatientId,
                Direction = dto.Direction,
                Content = dto.Content,
                TransferDate = DateTime.Now
            };

            _context.Set<HL7Message>().Add(message);
            await _context.SaveChangesAsync(cancellationToken);

            return new HL7MessageResponseDto
            {
                MessageId = message.MessageId,
                PatientId = message.PatientId,
                Direction = message.Direction,
                Content = message.Content,
                TransferDate = message.TransferDate
            };
        }

        public async Task UpdateAsync(int id, UpdateHL7MessageDto dto, CancellationToken cancellationToken = default)
        {
            var message = await _context.Set<HL7Message>()
                .FirstOrDefaultAsync(m => m.MessageId == id, cancellationToken);

            if (message == null)
                throw new KeyNotFoundException($"HL7 message with ID {id} not found.");

            if (dto.PatientId.HasValue)
                message.PatientId = dto.PatientId;
            if (dto.Direction != null)
                message.Direction = dto.Direction;
            if (dto.Content != null)
                message.Content = dto.Content;

            _context.Set<HL7Message>().Update(message);
            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
        {
            var message = await _context.Set<HL7Message>()
                .FirstOrDefaultAsync(m => m.MessageId == id, cancellationToken);

            if (message == null)
                throw new KeyNotFoundException($"HL7 message with ID {id} not found.");

            _context.Set<HL7Message>().Remove(message);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
