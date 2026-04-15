using api.Data;
using api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly PasswordHasher<User> _hasher;

        public AuthController(AppDbContext context)
        {
            _context = context;
            _hasher = new PasswordHasher<User>();
        }

        [HttpPost("register")]
        public IActionResult Register([FromBody] User user)
        {
            if (string.IsNullOrEmpty(user.Name) ||
                string.IsNullOrEmpty(user.Email) ||
                string.IsNullOrEmpty(user.Password))
            {
                return BadRequest("Заповни всі поля");
            }

            if (_context.Users.Any(u => u.Email == user.Email))
            {
                return BadRequest("Користувач вже існує");
            }

            user.Password = _hasher.HashPassword(user, user.Password);

            _context.Users.Add(user);
            _context.SaveChanges();

            return Ok("Реєстрація успішна ✅");
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] User loginUser)
        {
            var user = _context.Users.FirstOrDefault(u => u.Email == loginUser.Email);

            if (user == null)
                return BadRequest("Користувача не знайдено");

            var result = _hasher.VerifyHashedPassword(user, user.Password, loginUser.Password);

            if (result == PasswordVerificationResult.Failed)
                return BadRequest("Невірний пароль");

            return Ok(user);
        }
    }
}