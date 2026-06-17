using System.Security;
using System.Text;
using System.Xml.Linq;
using Elderlynk.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace Elderlynk.Services
{
    public class HL7MessageService : IHL7MessageService
    {
        private readonly DbContext _context;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _config;

        public HL7MessageService(DbContext context, IHttpClientFactory httpClientFactory, IConfiguration config)
        {
            _context = context;
            _httpClientFactory = httpClientFactory;
            _config = config;
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

        public async Task<SendHL7ResultDto?> SendToExternalAsync(int messageId, string targetUrl, CancellationToken cancellationToken = default)
        {
            var message = await _context.Set<HL7Message>()
                .AsNoTracking()
                .FirstOrDefaultAsync(m => m.MessageId == messageId, cancellationToken);

            if (message == null)
                return null;

            var client = _httpClientFactory.CreateClient();
            client.Timeout = TimeSpan.FromSeconds(30);

            // FHIR XML media type so the receiver knows how to parse the body.
            var content = new StringContent(message.Content ?? string.Empty, Encoding.UTF8, "application/fhir+xml");

            // Shared secret agreed by both clinics; the receiver checks the same value.
            var apiKey = _config["Interop:ApiKey"];
            if (!string.IsNullOrEmpty(apiKey))
                content.Headers.Add("X-Api-Key", apiKey);

            try
            {
                var response = await client.PostAsync(targetUrl, content, cancellationToken);
                var body = await response.Content.ReadAsStringAsync(cancellationToken);
                return new SendHL7ResultDto
                {
                    Success = response.IsSuccessStatusCode,
                    StatusCode = (int)response.StatusCode,
                    ResponseBody = body
                };
            }
            catch (Exception ex)
            {
                return new SendHL7ResultDto { Success = false, StatusCode = 0, ResponseBody = ex.Message };
            }
        }

        public async Task<HL7MessageResponseDto> ReceiveExternalAsync(string fhirXml, CancellationToken cancellationToken = default)
        {
            // Try to attach the incoming message to a local patient via the CNP carried
            // in the Bundle's Patient.identifier; otherwise store it unlinked.
            int? patientId = null;
            var cnp = ExtractCnp(fhirXml);
            if (!string.IsNullOrEmpty(cnp))
            {
                var patient = await _context.Set<Patient>()
                    .AsNoTracking()
                    .FirstOrDefaultAsync(p => p.CNP == cnp, cancellationToken);
                patientId = patient?.PatientId;
            }

            var message = new HL7Message
            {
                PatientId = patientId,
                Direction = "IN",
                Content = fhirXml,
                TransferDate = DateTime.Now
            };

            _context.Set<HL7Message>().Add(message);
            await _context.SaveChangesAsync(cancellationToken);

            return Map(message);
        }

        // Pull the CNP from a FHIR Bundle's first Patient.identifier value.
        private static string? ExtractCnp(string fhirXml)
        {
            try
            {
                XNamespace ns = Fhir;
                var doc = XDocument.Parse(fhirXml);
                var patient = doc.Descendants(ns + "Patient").FirstOrDefault();
                return patient?.Descendants(ns + "identifier").FirstOrDefault()
                    ?.Element(ns + "value")?.Attribute("value")?.Value;
            }
            catch
            {
                return null;
            }
        }

        private static HL7MessageResponseDto Map(HL7Message m) => new()
        {
            MessageId = m.MessageId,
            PatientId = m.PatientId,
            Direction = m.Direction,
            Content = m.Content,
            TransferDate = m.TransferDate
        };

        // ===== FHIR R4 message builders =====
        // The Continut_XML_HL7 column is an XML type, so messages are emitted as
        // FHIR R4 XML "message" Bundles (HL7's modern interoperability standard).
        // A referral is carried as a ServiceRequest, a reply as a Communication;
        // each Bundle also embeds the relevant Patient and a MessageHeader.

        private const string Fhir = "http://hl7.org/fhir";

        // Escape a string for use inside a FHIR primitive's value="" attribute.
        private static string X(string? s) => SecurityElement.Escape(s ?? string.Empty) ?? string.Empty;

        // FHIR instant: ISO 8601 with timezone offset, e.g. 2026-06-17T21:01:04+03:00.
        private static string Instant(DateTime d) => d.ToString("yyyy-MM-ddTHH:mm:sszzz");

        // Derive FHIR administrative gender from the CNP's first digit (odd = male).
        private static string GenderFromCnp(string? cnp)
        {
            if (string.IsNullOrEmpty(cnp) || cnp[0] < '0' || cnp[0] > '9') return "unknown";
            return (cnp[0] - '0') % 2 == 1 ? "male" : "female";
        }

        // Emit a <Patient> resource entry shared by both referral and reply Bundles.
        private static void AppendPatientEntry(StringBuilder sb, int? patientId, Patient? patient)
        {
            var birthDate = patient?.CNP != null ? CNPHelper.ExtractBirthDateFromCNP(patient.CNP) : null;
            sb.AppendLine($"  <entry>");
            sb.AppendLine($"    <fullUrl value=\"urn:uuid:patient-{patientId}\" />");
            sb.AppendLine($"    <resource>");
            sb.AppendLine($"      <Patient>");
            sb.AppendLine($"        <id value=\"{patientId}\" />");
            sb.AppendLine($"        <identifier>");
            sb.AppendLine($"          <system value=\"urn:oid:1.3.6.1.4.1.48916.1.1\" />"); // CNP namespace
            sb.AppendLine($"          <value value=\"{X(patient?.CNP)}\" />");
            sb.AppendLine($"        </identifier>");
            sb.AppendLine($"        <name>");
            sb.AppendLine($"          <family value=\"{X(patient?.LastName)}\" />");
            sb.AppendLine($"          <given value=\"{X(patient?.FirstName)}\" />");
            sb.AppendLine($"        </name>");
            sb.AppendLine($"        <gender value=\"{GenderFromCnp(patient?.CNP)}\" />");
            if (birthDate.HasValue)
                sb.AppendLine($"        <birthDate value=\"{birthDate.Value:yyyy-MM-dd}\" />");
            sb.AppendLine($"      </Patient>");
            sb.AppendLine($"    </resource>");
            sb.AppendLine($"  </entry>");
        }

        private static string BuildReferralXml(GenerateReferralDto dto, Patient? patient)
        {
            var now = DateTime.Now;
            var controlId = $"REF{now:yyyyMMddHHmmss}";

            var sb = new StringBuilder();
            sb.AppendLine($"<Bundle xmlns=\"{Fhir}\">");
            sb.AppendLine($"  <identifier>");
            sb.AppendLine($"    <value value=\"{X(controlId)}\" />");
            sb.AppendLine($"  </identifier>");
            sb.AppendLine($"  <type value=\"message\" />");
            sb.AppendLine($"  <timestamp value=\"{Instant(now)}\" />");

            // MessageHeader – routing + event.
            sb.AppendLine($"  <entry>");
            sb.AppendLine($"    <fullUrl value=\"urn:uuid:header-{controlId}\" />");
            sb.AppendLine($"    <resource>");
            sb.AppendLine($"      <MessageHeader>");
            sb.AppendLine($"        <eventCoding>");
            sb.AppendLine($"          <system value=\"http://terminology.hl7.org/CodeSystem/v2-0003\" />");
            sb.AppendLine($"          <code value=\"R01\" />");
            sb.AppendLine($"          <display value=\"Referral - REF^I12\" />");
            sb.AppendLine($"        </eventCoding>");
            sb.AppendLine($"        <source>");
            sb.AppendLine($"          <name value=\"ELDERLYNK\" />");
            sb.AppendLine($"          <endpoint value=\"urn:elderlynk:app\" />");
            sb.AppendLine($"        </source>");
            sb.AppendLine($"        <destination>");
            sb.AppendLine($"          <name value=\"SPECIALIST_SYS\" />");
            sb.AppendLine($"          <endpoint value=\"urn:specialist:sys\" />");
            sb.AppendLine($"        </destination>");
            sb.AppendLine($"        <focus>");
            sb.AppendLine($"          <reference value=\"urn:uuid:servicerequest-{controlId}\" />");
            sb.AppendLine($"        </focus>");
            sb.AppendLine($"      </MessageHeader>");
            sb.AppendLine($"    </resource>");
            sb.AppendLine($"  </entry>");

            AppendPatientEntry(sb, dto.PatientId, patient);

            // ServiceRequest – the referral itself.
            sb.AppendLine($"  <entry>");
            sb.AppendLine($"    <fullUrl value=\"urn:uuid:servicerequest-{controlId}\" />");
            sb.AppendLine($"    <resource>");
            sb.AppendLine($"      <ServiceRequest>");
            sb.AppendLine($"        <status value=\"active\" />");
            sb.AppendLine($"        <intent value=\"order\" />");
            sb.AppendLine($"        <priority value=\"routine\" />");
            sb.AppendLine($"        <code>");
            sb.AppendLine($"          <text value=\"{X(dto.Specialty)}\" />");
            sb.AppendLine($"        </code>");
            sb.AppendLine($"        <subject>");
            sb.AppendLine($"          <reference value=\"urn:uuid:patient-{dto.PatientId}\" />");
            sb.AppendLine($"        </subject>");
            sb.AppendLine($"        <authoredOn value=\"{Instant(now)}\" />");
            sb.AppendLine($"        <reasonCode>");
            sb.AppendLine($"          <text value=\"{X(dto.Reason)}\" />");
            sb.AppendLine($"        </reasonCode>");
            if (!string.IsNullOrEmpty(dto.ClinicalInfo))
            {
                sb.AppendLine($"        <note>");
                sb.AppendLine($"          <text value=\"{X(dto.ClinicalInfo)}\" />");
                sb.AppendLine($"        </note>");
            }
            sb.AppendLine($"      </ServiceRequest>");
            sb.AppendLine($"    </resource>");
            sb.AppendLine($"  </entry>");
            sb.AppendLine($"</Bundle>");
            return sb.ToString();
        }

        private static string BuildMedicalLetterXml(HL7Message referral, Patient? patient)
        {
            var now = DateTime.Now;
            var controlId = $"LTR{now:yyyyMMddHHmmss}";
            var letter =
                "Scrisoare medicală: Pacient evaluat de medicul specialist. " +
                "Recomandări: continuarea schemei terapeutice curente, monitorizare periodică a parametrilor și " +
                "reevaluare la 30 de zile. Investigații suplimentare nu sunt necesare în acest moment.";

            var sb = new StringBuilder();
            sb.AppendLine($"<Bundle xmlns=\"{Fhir}\">");
            sb.AppendLine($"  <identifier>");
            sb.AppendLine($"    <value value=\"{X(controlId)}\" />");
            sb.AppendLine($"  </identifier>");
            sb.AppendLine($"  <type value=\"message\" />");
            sb.AppendLine($"  <timestamp value=\"{Instant(now)}\" />");

            // MessageHeader – reply routing, references the referral it answers.
            sb.AppendLine($"  <entry>");
            sb.AppendLine($"    <fullUrl value=\"urn:uuid:header-{controlId}\" />");
            sb.AppendLine($"    <resource>");
            sb.AppendLine($"      <MessageHeader>");
            sb.AppendLine($"        <eventCoding>");
            sb.AppendLine($"          <system value=\"http://terminology.hl7.org/CodeSystem/v2-0003\" />");
            sb.AppendLine($"          <code value=\"R01\" />");
            sb.AppendLine($"          <display value=\"Referral response - REF^I13\" />");
            sb.AppendLine($"        </eventCoding>");
            sb.AppendLine($"        <source>");
            sb.AppendLine($"          <name value=\"SPECIALIST_SYS\" />");
            sb.AppendLine($"          <endpoint value=\"urn:specialist:sys\" />");
            sb.AppendLine($"        </source>");
            sb.AppendLine($"        <destination>");
            sb.AppendLine($"          <name value=\"ELDERLYNK\" />");
            sb.AppendLine($"          <endpoint value=\"urn:elderlynk:app\" />");
            sb.AppendLine($"        </destination>");
            sb.AppendLine($"        <response>");
            sb.AppendLine($"          <identifier value=\"{referral.MessageId}\" />");
            sb.AppendLine($"          <code value=\"ok\" />");
            sb.AppendLine($"        </response>");
            sb.AppendLine($"        <focus>");
            sb.AppendLine($"          <reference value=\"urn:uuid:communication-{controlId}\" />");
            sb.AppendLine($"        </focus>");
            sb.AppendLine($"      </MessageHeader>");
            sb.AppendLine($"    </resource>");
            sb.AppendLine($"  </entry>");

            AppendPatientEntry(sb, referral.PatientId, patient);

            // Communication – the medical letter.
            sb.AppendLine($"  <entry>");
            sb.AppendLine($"    <fullUrl value=\"urn:uuid:communication-{controlId}\" />");
            sb.AppendLine($"    <resource>");
            sb.AppendLine($"      <Communication>");
            sb.AppendLine($"        <status value=\"completed\" />");
            sb.AppendLine($"        <subject>");
            sb.AppendLine($"          <reference value=\"urn:uuid:patient-{referral.PatientId}\" />");
            sb.AppendLine($"        </subject>");
            sb.AppendLine($"        <sent value=\"{Instant(now)}\" />");
            sb.AppendLine($"        <payload>");
            sb.AppendLine($"          <contentString value=\"{X(letter)}\" />");
            sb.AppendLine($"        </payload>");
            sb.AppendLine($"      </Communication>");
            sb.AppendLine($"    </resource>");
            sb.AppendLine($"  </entry>");
            sb.AppendLine($"</Bundle>");
            return sb.ToString();
        }
    }
}
