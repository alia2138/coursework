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
        public IActionResult UpdateProgress([FromBody] ProgressDTO dto)
        {
            var existing = _context.Progresses
                .FirstOrDefault(p => p.UserId == dto.UserId && p.LessonId == dto.LessonId);

            int newPercentage = (int)((double)dto.CorrectAnswers / dto.TotalQuestions * 100);

            if (existing == null)
            {
                existing = new Progress
                {
                    UserId = dto.UserId,
                    LessonId = dto.LessonId,
                    CorrectAnswers = dto.CorrectAnswers,
                    TotalQuestions = dto.TotalQuestions,
                    Percentage = newPercentage,
                    IsCompleted = newPercentage >= 60
                };
                _context.Progresses.Add(existing);
            }
            else
            {
                if (newPercentage > existing.Percentage)
                {
                    existing.CorrectAnswers = dto.CorrectAnswers;
                    existing.TotalQuestions = dto.TotalQuestions;
                    existing.Percentage = newPercentage;
                    if (newPercentage >= 80) existing.IsCompleted = true;
                }
            }
            var user = _context.Users.FirstOrDefault(u => u.Id == dto.UserId);
            if (user != null && existing.IsCompleted)
            {
                // цей кусок коду тре переписати, бо він не враховує, що юзер може проходити декілька уроків в один день і отримувати нагороди за кожен
                user.Streak += 1;
            }

            _context.SaveChanges();
            return Ok(existing);
        }

        [HttpGet("with-progress/{courseId}/{userId}")]
        public IActionResult GetLessonsWithProgress(int courseId, int userId)
        {
            var lessons = _context.Lessons
                .Where(l => l.CourseId == courseId)
                .OrderBy(l => l.Id)
                .ToList();

            var lessonIds = lessons.Select(l => l.Id).ToList();
            var progresses = _context.Progresses
                .Where(p => p.UserId == userId && lessonIds.Contains(p.LessonId))
                .ToList();

            var result = new List<object>();

            for (int i = 0; i < lessons.Count; i++)
            {
                var currentLesson = lessons[i];
                bool unlocked = i == 0;

                if (i > 0)
                {
                    var prevLessonId = lessons[i - 1].Id;
                    unlocked = progresses.Any(p => p.LessonId == prevLessonId && p.IsCompleted);
                }

                var progress = progresses.FirstOrDefault(p => p.LessonId == currentLesson.Id);

                result.Add(new
                {
                    id = currentLesson.Id,
                    title = currentLesson.Title,
                    unlocked = unlocked,
                    isCompleted = progress?.IsCompleted ?? false,
                    percentage = progress?.Percentage ?? 0
                });
            }

            return Ok(result);
        }

        [HttpGet("stats/{userId}")]
        public IActionResult GetStats(int userId)
        {
            var data = _context.Progresses
                .Where(p => p.UserId == userId)
                .Join(_context.Lessons, p => p.LessonId, l => l.Id, (p, l) => new { p, l })
                .Join(_context.Courses, pl => pl.l.CourseId, c => c.Id, (pl, c) => new { c.Name, pl.p.CorrectAnswers, pl.p.TotalQuestions })
                .ToList();

            var result = data.GroupBy(x => x.Name)
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