using api.Data;
using api.Models;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CourseController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CourseController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult GetCourses()
        {
            return Ok(_context.Courses.ToList());
        }

        [HttpPost]
        public IActionResult AddCourse([FromBody] Course course)
        {
            _context.Courses.Add(course);
            _context.SaveChanges();
            return Ok(course);
        }
        [HttpPut("{id}")]
        public IActionResult UpdateCourse(int id, [FromBody] Course updatedCourse)
        {
            var course = _context.Courses.FirstOrDefault(c => c.Id == id);

            if (course == null)
                return NotFound("Курс не знайдено");

            course.Name = updatedCourse.Name;

            _context.SaveChanges();

            return Ok(course);
        }
        [HttpDelete("{id}")]
        public IActionResult DeleteCourse(int id)
        {
            var course = _context.Courses.FirstOrDefault(c => c.Id == id);

            if (course == null)
                return NotFound("Курс не знайдено");

            _context.Courses.Remove(course);
            _context.SaveChanges();

            return Ok("Курс видалено");
        }
    }
}