using api.Data;
using api.Models;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HeartController : ControllerBase
    {
        private readonly AppDbContext _context;

        private const int MAX_HEARTS = 5;
        private const int REGEN_MINUTES = 5;

        public HeartController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("{userId}")]
        public IActionResult GetHearts(int userId)
        {
            var user = _context.Users.FirstOrDefault(x => x.Id == userId);
            if (user == null) return NotFound();

            RegenerateHearts(user);

            _context.SaveChanges();

            return Ok(new
            {
                hearts = user.Hearts,
                lastUpdate = user.LastHeartUpdate
            });
        }
        [HttpPost("lose/{userId}")]
        public IActionResult LoseHeart(int userId)
        {
            var user = _context.Users.FirstOrDefault(x => x.Id == userId);
            if (user == null) return NotFound();

            RegenerateHearts(user);

            if (user.Hearts <= 0)
                return BadRequest("Немає сердець");

            user.Hearts--;

            if (user.Hearts == MAX_HEARTS - 1)
            {
                user.LastHeartUpdate = DateTime.Now;
            }

            _context.SaveChanges();

            return Ok(new { hearts = user.Hearts });
        }
        [HttpGet("can-start/{userId}")]
        public IActionResult CanStart(int userId)
        {
            var user = _context.Users.FirstOrDefault(x => x.Id == userId);
            if (user == null) return NotFound();

            RegenerateHearts(user);

            _context.SaveChanges();

            return Ok(new
            {
                canStart = user.Hearts > 0,
                hearts = user.Hearts
            });
        }

        private void RegenerateHearts(User user)
        {
            if (user.Hearts >= MAX_HEARTS)
                return;

            if (user.LastHeartUpdate == null)
            {
                user.LastHeartUpdate = DateTime.Now;
                return;
            }

            var minutesPassed = (DateTime.Now - user.LastHeartUpdate.Value).TotalMinutes;

            int heartsToAdd = (int)(minutesPassed / REGEN_MINUTES);

            if (heartsToAdd > 0)
            {
                user.Hearts = Math.Min(MAX_HEARTS, user.Hearts + heartsToAdd);
                user.LastHeartUpdate = DateTime.Now;
            }
        }
    }
}