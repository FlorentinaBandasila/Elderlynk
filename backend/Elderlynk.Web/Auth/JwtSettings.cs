namespace Elderlynk.Web.Auth
{
    public class JwtSettings
    {
        public const string SectionName = "JwtSettings";

        public string Secret { get; set; } = null!;
        public string Issuer { get; set; } = "CareLink";
        public string Audience { get; set; } = "CareLinkUsers";
        public int ExpiryHours { get; set; } = 8;
    }
}
