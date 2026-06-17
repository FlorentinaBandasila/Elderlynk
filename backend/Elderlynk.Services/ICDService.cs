using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Clients.ActiveDirectory;
using System.Collections.Concurrent;

namespace Elderlynk.Services
{
    public class ICDService : IICDService
    {
        private static readonly ConcurrentDictionary<string, string> IcdCache = new();
        private readonly HttpClient _httpClient;
        private readonly ILogger<ICDService> _logger;

        // Local ICD10 mapping for common codes
        private static readonly Dictionary<string, string> LocalICDMapping = new()
        {
            { "I10", "Essential Hypertension" },
            { "I47", "Paroxysmal Tachycardia" },
            { "I47.1", "Supraventricular Tachycardia" },
            { "I47.2", "Ventricular Tachycardia" },
            { "I25", "Chronic Ischemic Heart Disease" },
            { "I25.1", "Atherosclerotic Heart Disease" },
            { "I49", "Other Cardiac Arrhythmias" },
            { "I49.9", "Cardiac Arrhythmia, Unspecified" },
            { "I50", "Heart Failure" },
            { "I50.9", "Heart Failure, Unspecified" },
            { "E11", "Type 2 Diabetes Mellitus" },
            { "E14", "Unspecified Diabetes Mellitus" },
            { "J45", "Asthma" },
            { "J44", "Chronic Obstructive Pulmonary Disease" },
            { "K21", "Gastro-Esophageal Reflux Disease" },
            { "N18", "Chronic Kidney Disease" },
            { "M17", "Bilateral Primary Osteoarthritis of Knee" },
            { "M19", "Unspecified Osteoarthritis" },
            { "R07", "Chest Pain" },
            { "R06", "Abnormalities of Breathing" },
            { "R10", "Abdominal Pain" },
            { "401", "Essential Hypertension" },
            { "427", "Cardiac Arrhythmias" },
            { "250", "Diabetes Mellitus" },
            { "414", "Chronic Ischemic Heart Disease" },
            { "428", "Congestive Heart Failure" },
        };

        public ICDService(Microsoft.IdentityModel.Clients.ActiveDirectory.IHttpClientFactory httpClientFactory, ILogger<ICDService> logger)
        {
            _httpClient = httpClientFactory.GetHttpClient();
            _logger = logger;
        }

        public async Task<string> GetICDDescriptionAsync(string code, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(code))
                return "Unknown";

            // Check local cache first
            if (IcdCache.TryGetValue(code, out var cached))
            {
                _logger.LogInformation($"Cache hit for ICD code: {code}");
                return cached;
            }

            // Check local mapping
            if (LocalICDMapping.TryGetValue(code, out var description))
            {
                IcdCache.TryAdd(code, description);
                return description;
            }

            // Try to fetch from external API (fallback)
            try
            {
                var description_api = await FetchFromExternalAPIAsync(code, cancellationToken);
                if (!string.IsNullOrWhiteSpace(description_api))
                {
                    IcdCache.TryAdd(code, description_api);
                    return description_api;
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning($"Failed to fetch ICD code {code} from external API: {ex.Message}");
            }

            // Fallback: return code as-is
            IcdCache.TryAdd(code, code);
            return code;
        }

        private async Task<string> FetchFromExternalAPIAsync(string code, CancellationToken cancellationToken)
        {
            try
            {
                // Using SNOMED CT browser as fallback
                var url = $"https://browser.ihtsdotools.org/snomed-browser/index.html#/concepts/{code}";
                // For actual integration, you would need a proper ICD lookup API with proper credentials
                // This is just a placeholder
                _logger.LogInformation($"Attempting to fetch ICD code {code} from external source");
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error fetching from external API: {ex.Message}");
                return null;
            }
        }
    }
}
