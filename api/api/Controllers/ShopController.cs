using api.Data;
using api.DTO;
using api.Models;
using Microsoft.AspNetCore.Mvc;
using System.Linq;

namespace api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ShopController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ShopController(AppDbContext context)
        {
            _context = context;
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

            // 📚 КУРС
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

            // 🔹 ІНШІ ТОВАРИ
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