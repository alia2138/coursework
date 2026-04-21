using api.Data;
using api.Models;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserCourseController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UserCourseController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("{userId}")]
        public IActionResult GetUserCourses(int userId)
        {
            var courses = _context.UserCourses
                .Where(uc => uc.UserId == userId)
                .Select(uc => uc.CourseId)
                .ToList();

            return Ok(courses);
        }

        [HttpPost]
        public IActionResult AddUserCourse([FromBody] UserCourse dto)
        {
            if (dto.UserId == 0 || dto.CourseId == 0)
                return BadRequest("Невірні дані");

            var exists = _context.UserCourses
                .Any(uc => uc.UserId == dto.UserId && uc.CourseId == dto.CourseId);

            if (exists)
                return BadRequest("Курс вже доданий");

            var userCourse = new UserCourse
            {
                UserId = dto.UserId,
                CourseId = dto.CourseId
            };

            _context.UserCourses.Add(userCourse);
            _context.SaveChanges();

            return Ok("Курс додано користувачу");
        }

        [HttpDelete]
        public IActionResult RemoveUserCourse(int userId, int courseId)
        {
            var uc = _context.UserCourses
                .FirstOrDefault(x => x.UserId == userId && x.CourseId == courseId);

            if (uc == null)
                return NotFound();

            _context.UserCourses.Remove(uc);
            _context.SaveChanges();

            return Ok("Курс видалено");
        }
    }
}