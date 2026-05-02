using api.Models;

namespace api.Interfaces
{
    public interface IAuthService
    {
        Task<string> Register(string email, string password);
        Task<string> Login(string email, string password);
        Task Register(RegisterRequest request);
    }
}
