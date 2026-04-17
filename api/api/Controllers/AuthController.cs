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
        public IActionResult Register([FromBody] RegisterRequest request)
        {
            if (string.IsNullOrEmpty(request.Name) ||
                string.IsNullOrEmpty(request.Email) ||
                string.IsNullOrEmpty(request.Password))
            {
                return BadRequest("Заповни всі поля");
            }

            if (_context.Users.Any(u => u.Email == request.Email))
            {
                return BadRequest("Користувач вже існує");
            }

            var user = new User
            {
                Name = request.Name,
                Email = request.Email,
                Password = _hasher.HashPassword(null, request.Password)
            };

            _context.Users.Add(user);
            _context.SaveChanges();

            return Ok("Реєстрація успішна ");
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            if (string.IsNullOrEmpty(request.Email) ||
                string.IsNullOrEmpty(request.Password))
            {
                return BadRequest("Введи email і пароль");
            }

            var user = _context.Users.FirstOrDefault(u => u.Email == request.Email);

            if (user == null)
                return BadRequest("Користувача не знайдено");

            var result = _hasher.VerifyHashedPassword(user, user.Password, request.Password);

            if (result == PasswordVerificationResult.Failed)
                return BadRequest("Невірний пароль");

            return Ok(new
            {
                user.Id,
                user.Name,
                user.Email,
                user.Hearts,
                user.Diamonds,
                user.Streak
            });
        }
    }
}