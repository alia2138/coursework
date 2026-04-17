using api.Data;
using api.Models;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LessonController : ControllerBase
    {
        private readonly AppDbContext _context;

        public LessonController(AppDbContext context)
        {
            _context = context;
        }
        [HttpPost]
        public IActionResult AddLesson([FromBody] CreateLessonDTO dto)
        {
            var lesson = new Lesson
            {
                Title = dto.Title,
                CourseId = dto.CourseId
            };

            _context.Lessons.Add(lesson);
            _context.SaveChanges();

            return Ok(lesson);
        }
        [HttpGet("{courseId}")]
        public IActionResult GetLessons(int courseId)
        {
            var lessons = _context.Lessons
                .Where(l => l.CourseId == courseId)
                .ToList();

            return Ok(lessons);
        }
    }
}