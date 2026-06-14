namespace Elderlynk.Services
{
    public interface IICDService
    {
        Task<string> GetICDDescriptionAsync(string code, CancellationToken cancellationToken = default);
    }
}
