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
            if (string.IsNullOrWhiteSpace(dto.Title))
                return BadRequest("Назва уроку обовʼязкова");

            var courseExists = _context.Courses.Any(c => c.Id == dto.CourseId);

            if (!courseExists)
                return BadRequest("Курс не знайдено");

            var lesson = new Lesson
            {
                Title = dto.Title,
                Theory = dto.Theory, 
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
                .Select(l => new
                {
                    l.Id,
                    l.Title,
                    l.Theory 
                })
                .ToList();

            return Ok(lessons);
        }

        [HttpGet("single/{id}")]
        public IActionResult GetLesson(int id)
        {
            var lesson = _context.Lessons
                .Where(l => l.Id == id)
                .Select(l => new
                {
                    l.Id,
                    l.Title,
                    l.Theory
                })
                .FirstOrDefault();

            if (lesson == null)
                return NotFound("Урок не знайдено");

            return Ok(lesson);
        }
        [HttpPut("{id}")]
        public IActionResult UpdateLesson(int id, [FromBody] UpdateLessonDTO dto)
        {
            var lesson = _context.Lessons.FirstOrDefault(l => l.Id == id);

            if (lesson == null)
                return NotFound();

            lesson.Title = dto.Title;
            lesson.Theory = dto.Theory;

            _context.SaveChanges();

            return Ok(lesson);
        }
        [HttpDelete("{id}")]
        public IActionResult DeleteLesson(int id)
        {
            var lesson = _context.Lessons.FirstOrDefault(l => l.Id == id);

            if (lesson == null)
                return NotFound("Урок не знайдено");

            _context.Lessons.Remove(lesson);
            _context.SaveChanges();

            return Ok("Урок видалено");
        }
    }
}