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
    }
}