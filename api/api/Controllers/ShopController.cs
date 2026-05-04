using api.Data;
using api.DTO;
using api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]

    public class ShopController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly string _publicKey = "sandbox_i1675738884";
        private readonly string _privateKey = "sandbox_Rs6QPNmuK0sqIy3cw8FWDftULjovd17xKWBveOP5";

        public ShopController(AppDbContext context)
        {
            _context = context;
        }

        private string CreateSignature(string privateKey, string data)
        {
            var rawSignature = privateKey + data + privateKey;
            using (var sha1 = System.Security.Cryptography.SHA1.Create())
            {
                byte[] hashBytes = sha1.ComputeHash(Encoding.UTF8.GetBytes(rawSignature));
                return Convert.ToBase64String(hashBytes);
            }
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            var shopItems = _context.ShopItems
                .Select(x => new ShopItemDTO
                {
                    Id = x.Id,
                    Name = x.Name,
                    Type = x.Type,
                    Price = x.Price,
                    Value = x.Value,
                    CourseId = x.CourseId
                })
                .ToList();

            var courses = _context.Courses
                .Select(c => new ShopItemDTO
                {
                    Id = -c.Id,
                    Name = c.Name,
                    Type = "course",
                    Price = 1000,
                    Value = 0,
                    CourseId = c.Id
                })
                .ToList();

            var result = shopItems.Concat(courses).ToList();

            return Ok(result);
        }
        [HttpPost("buy")]
        public IActionResult Buy([FromBody] BuyDTO dto)
        {
            var user = _context.Users.FirstOrDefault(u => u.Id == dto.UserId);
            if (user == null) return BadRequest();

            if (dto.ItemId < 0)
            {
                int courseId = Math.Abs(dto.ItemId);

                bool owned = _context.UserCourses
                    .Any(x => x.UserId == dto.UserId && x.CourseId == courseId);

                if (owned)
                    return Ok(new { success = false, message = "Вже куплено" });

                if (user.Diamonds < 1000)
                    return Ok(new { success = false, message = "Недостатньо 💎" });

                user.Diamonds -= 1000;

                _context.UserCourses.Add(new UserCourse
                {
                    UserId = dto.UserId,
                    CourseId = courseId
                });

                _context.SaveChanges();

                return Ok(new { success = true, diamonds = user.Diamonds });
            }

            var item = _context.ShopItems.FirstOrDefault(x => x.Id == dto.ItemId);
            if (item == null)
                return Ok(new { success = false, message = "Item не знайдено" });

            Console.WriteLine("TYPE: " + item.Type);

            if (item.Type.ToLower() == "hearts")
            {
                if (user.Diamonds < item.Price)
                    return Ok(new { success = false, message = "Недостатньо 💎" });

                user.Diamonds -= item.Price;
                user.Hearts += item.Value;
            }
            else if (item.Type.ToLower() == "donate")
            {
                user.Diamonds += item.Value;
            }
            else
            {
                return Ok(new { success = false, message = "Невідомий тип: " + item.Type });
            }

            _context.SaveChanges();

            return Ok(new
            {
                success = true,
                diamonds = user.Diamonds,
                hearts = user.Hearts
            });
        }
        [HttpPost]
        public IActionResult Create([FromBody] ShopItemDTO dto)
        {
            if (dto == null || string.IsNullOrEmpty(dto.Name))
            {
                return BadRequest(new { message = "Дані неповні" });
            }

            var newItem = new ShopItem
            {
                Name = dto.Name,
                Type = dto.Type,
                Price = dto.Price,
                Value = dto.Value,
                CourseId = dto.CourseId
            };

            _context.ShopItems.Add(newItem);
            _context.SaveChanges();

            return Ok(new { success = true, id = newItem.Id });
        }
    }
}