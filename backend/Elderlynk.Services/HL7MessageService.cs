using System.Security;
using System.Text;
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

        public async Task<IEnumerable<HL7MessageResponseDto>> GetByPatientAsync(int patientId, CancellationToken cancellationToken = default)
        {
            var messages = await _context.Set<HL7Message>()
                .AsNoTracking()
                .Where(m => m.PatientId == patientId)
                .OrderByDescending(m => m.TransferDate)
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

        public async Task<HL7MessageResponseDto> GenerateReferralAsync(GenerateReferralDto dto, CancellationToken cancellationToken = default)
        {
            var patient = await _context.Set<Patient>()
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.PatientId == dto.PatientId, cancellationToken);

            var content = BuildReferralXml(dto, patient);

            var message = new HL7Message
            {
                PatientId = dto.PatientId,
                Direction = "OUT",
                Content = content,
                TransferDate = DateTime.Now
            };

            _context.Set<HL7Message>().Add(message);
            await _context.SaveChangesAsync(cancellationToken);

            return Map(message);
        }

        public async Task<HL7MessageResponseDto?> GenerateReplyAsync(int referralMessageId, CancellationToken cancellationToken = default)
        {
            var referral = await _context.Set<HL7Message>()
                .AsNoTracking()
                .FirstOrDefaultAsync(m => m.MessageId == referralMessageId, cancellationToken);

            if (referral == null)
                return null;

            var patient = await _context.Set<Patient>()
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.PatientId == referral.PatientId, cancellationToken);

            var content = BuildMedicalLetterXml(referral, patient);

            var letter = new HL7Message
            {
                PatientId = referral.PatientId,
                Direction = "IN",
                Content = content,
                TransferDate = DateTime.Now
            };

            _context.Set<HL7Message>().Add(letter);
            await _context.SaveChangesAsync(cancellationToken);

            return Map(letter);
        }

        private static HL7MessageResponseDto Map(HL7Message m) => new()
        {
            MessageId = m.MessageId,
            PatientId = m.PatientId,
            Direction = m.Direction,
            Content = m.Content,
            TransferDate = m.TransferDate
        };

        // ===== HL7 (v2-in-XML) message builders =====
        // The Continut_XML_HL7 column is an XML type, so messages are emitted as
        // well-formed XML envelopes carrying HL7 segments.

        private static string X(string? s) => SecurityElement.Escape(s ?? string.Empty) ?? string.Empty;

        private static string BuildReferralXml(GenerateReferralDto dto, Patient? patient)
        {
            var now = DateTime.Now;
            var controlId = $"REF{now:yyyyMMddHHmmss}";
            var patientName = patient != null ? $"{patient.LastName}^{patient.FirstName}" : "Necunoscut";

            var sb = new StringBuilder();
            sb.AppendLine("<HL7Message type=\"REF_I12\">");
            sb.AppendLine($"  <MSH sendingApp=\"ELDERLYNK\" receivingApp=\"SPECIALIST_SYS\" messageType=\"REF^I12\" controlId=\"{X(controlId)}\" timestamp=\"{now:yyyyMMddHHmmss}\" />");
            sb.AppendLine($"  <PID id=\"{dto.PatientId}\" name=\"{X(patientName)}\" cnp=\"{X(patient?.CNP)}\" />");
            sb.AppendLine($"  <RF1 specialty=\"{X(dto.Specialty)}\" status=\"P\" priority=\"R\" reason=\"{X(dto.Reason)}\" />");
            if (dto.ConsultationId.HasValue)
                sb.AppendLine($"  <PRD role=\"REFERRING\" consultationId=\"{dto.ConsultationId.Value}\" />");
            sb.AppendLine($"  <OBX type=\"TX\" id=\"ClinicalInfo\"><![CDATA[{dto.ClinicalInfo ?? string.Empty}]]></OBX>");
            sb.AppendLine("</HL7Message>");
            return sb.ToString();
        }

        private static string BuildMedicalLetterXml(HL7Message referral, Patient? patient)
        {
            var now = DateTime.Now;
            var controlId = $"LTR{now:yyyyMMddHHmmss}";
            var patientName = patient != null ? $"{patient.LastName}^{patient.FirstName}" : "Necunoscut";
            var letter =
                "Scrisoare medicală: Pacient evaluat de medicul specialist. " +
                "Recomandări: continuarea schemei terapeutice curente, monitorizare periodică a parametrilor și " +
                "reevaluare la 30 de zile. Investigații suplimentare nu sunt necesare în acest moment.";

            var sb = new StringBuilder();
            sb.AppendLine("<HL7Message type=\"REF_I13\">");
            sb.AppendLine($"  <MSH sendingApp=\"SPECIALIST_SYS\" receivingApp=\"ELDERLYNK\" messageType=\"REF^I13\" controlId=\"{X(controlId)}\" timestamp=\"{now:yyyyMMddHHmmss}\" inResponseTo=\"{referral.MessageId}\" />");
            sb.AppendLine($"  <PID id=\"{referral.PatientId}\" name=\"{X(patientName)}\" cnp=\"{X(patient?.CNP)}\" />");
            sb.AppendLine("  <RF1 status=\"C\" />");
            sb.AppendLine($"  <OBX type=\"TX\" id=\"MedicalLetter\"><![CDATA[{letter}]]></OBX>");
            sb.AppendLine("</HL7Message>");
            return sb.ToString();
        }
    }
}
