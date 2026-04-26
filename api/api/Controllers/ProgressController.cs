using api.Data;
using api.DTO;
using api.Models;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProgressController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProgressController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public IActionResult SaveProgress([FromBody] SaveProgressDTO dto)
        {
            int percent = (int)Math.Round((double)dto.CorrectAnswers / dto.TotalQuestions * 100);

            bool isCompleted = percent >= 60;

            int reward = 0;
            if (isCompleted)
            {
                reward = 60 + (percent - 60);
                if (reward > 100) reward = 100;
            }

            var progress = _context.Progresses
                .FirstOrDefault(p => p.UserId == dto.UserId && p.LessonId == dto.LessonId);

            if (progress == null)
            {
                progress = new Progress
                {
                    UserId = dto.UserId,
                    LessonId = dto.LessonId
                };
                _context.Progresses.Add(progress);
            }

            progress.CorrectAnswers = dto.CorrectAnswers;
            progress.TotalQuestions = dto.TotalQuestions;
            progress.Percentage = percent;
            progress.IsCompleted = isCompleted;
            progress.Reward = reward;

            var user = _context.Users.FirstOrDefault(u => u.Id == dto.UserId);

            if (user != null && isCompleted)
            {
                user.Diamonds += reward;

                user.Streak += 1;
            }

            _context.SaveChanges();

            return Ok(new
            {
                percent,
                isCompleted,
                reward
            });
        }
        [HttpGet("with-progress/{courseId}/{userId}")]
        public IActionResult GetLessonsWithProgress(int courseId, int userId)
        {
            var lessons = _context.Lessons
                .Where(l => l.CourseId == courseId)
                .OrderBy(l => l.Id)
                .ToList();

            var progresses = _context.Progresses
                .Where(p => p.UserId == userId)
                .ToList();

            var result = new List<object>();

            for (int i = 0; i < lessons.Count; i++)
            {
                bool unlocked = false;

                if (i == 0)
                {
                    unlocked = true; 
                }
                else
                {
                    var prevLesson = lessons[i - 1];

                    unlocked = progresses.Any(p =>
                        p.LessonId == prevLesson.Id && p.IsCompleted);
                }

                result.Add(new
                {
                    lessons[i].Id,
                    lessons[i].Title,
                    unlocked,
                    isCompleted = progresses.Any(p =>
                        p.LessonId == lessons[i].Id && p.IsCompleted)
                });
            }

            return Ok(result);
        }
        [HttpGet("stats/{userId}")]
        public IActionResult GetStats(int userId)
        {
            var data = _context.Progresses
                .Where(p => p.UserId == userId)
                .Join(_context.Lessons,
                    p => p.LessonId,
                    l => l.Id,
                    (p, l) => new { p, l })
                .Join(_context.Courses,
                    pl => pl.l.CourseId,
                    c => c.Id,
                    (pl, c) => new
                    {
                        c.Name,
                        pl.p.CorrectAnswers,
                        pl.p.TotalQuestions
                    })
                .ToList();

            var result = data
                .GroupBy(x => x.Name)
                .Select(g => new
                {
                    course = g.Key,
                    correct = g.Sum(x => x.CorrectAnswers),
                    total = g.Sum(x => x.TotalQuestions)
                });

            return Ok(result);
        }
        [HttpGet("{id}")]
        public IActionResult GetUser(int id)
        {
            var u = _context.Users.FirstOrDefault(x => x.Id == id);

            if (u == null) return NotFound();

            return Ok(u);
        }
        [HttpGet("full/{userId}")]
        public IActionResult GetFullProgress(int userId)
        {
            // 🔥 тільки курси користувача
            var userCourses = _context.UserCourses
                .Where(uc => uc.UserId == userId)
                .Select(uc => uc.CourseId)
                .ToList();

            var courses = _context.Courses
                .Where(c => userCourses.Contains(c.Id))
                .ToList();

            var progresses = _context.Progresses
                .Where(p => p.UserId == userId)
                .ToList();

            var lessons = _context.Lessons.ToList();

            var result = courses.Select(course =>
            {
                var courseLessons = lessons.Where(l => l.CourseId == course.Id).ToList();

                int lessonsTotal = courseLessons.Count;

                int lessonsDone = courseLessons.Count(l =>
                    progresses.Any(p => p.LessonId == l.Id && p.IsCompleted));

                var courseProgress = progresses
                    .Where(p => courseLessons.Any(l => l.Id == p.LessonId))
                    .ToList();

                int correct = courseProgress.Sum(p => p.CorrectAnswers);
                int total = courseProgress.Sum(p => p.TotalQuestions);

                return new
                {
                    course = course.Name,
                    correct,
                    total,
                    lessonsDone,
                    lessonsTotal
                };
            });

            return Ok(result);
        }
    }
}