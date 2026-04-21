using api.Data;
using api.DTO;
using api.Models;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UserController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("select-course")]
        public IActionResult SelectCourse([FromBody] SelectCourseDTO dto)
        {
            var exists = _context.UserCourses
                .Any(x => x.UserId == dto.UserId && x.CourseId == dto.CourseId);

            if (exists)
                return BadRequest("Курс вже доданий");

            var uc = new UserCourse
            {
                UserId = dto.UserId,
                CourseId = dto.CourseId
            };

            _context.UserCourses.Add(uc);
            _context.SaveChanges();

            return Ok("Курс додано");
        }

        [HttpGet("{userId}/courses")]
        public IActionResult GetUserCourses(int userId)
        {
            var courses = _context.UserCourses
                .Where(x => x.UserId == userId)
                .Select(x => x.Course)
                .ToList();

            return Ok(courses);
        }

    }
}