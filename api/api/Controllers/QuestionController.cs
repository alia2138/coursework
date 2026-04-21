using api.Data;
using api.Models;
using api.DTO;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class QuestionController : ControllerBase
    {
        private readonly AppDbContext _context;

        public QuestionController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public IActionResult AddQuestion([FromBody] CreateQuestionDTO dto)
        {
            var lessonExists = _context.Lessons.Any(l => l.Id == dto.LessonId);

            if (!lessonExists)
                return BadRequest("Невірний LessonId");

            var question = new Question
            {
                Text = dto.Text,
                Type = dto.Type,
                OptionsJson = dto.OptionsJson,
                CorrectAnswer = dto.CorrectAnswer,
                LessonId = dto.LessonId
            };

            _context.Questions.Add(question);
            _context.SaveChanges();

            return Ok(question);
        }

        [HttpGet("{lessonId}")]
        public IActionResult GetQuestions(int lessonId)
        {
            var questions = _context.Questions
                .Where(q => q.LessonId == lessonId)
                .ToList();

            return Ok(questions);
        }

        public class CheckDTO
        {
            public int QuestionId { get; set; }
            public string Answer { get; set; }
        }
        [HttpGet("get/{id}")]
        public IActionResult GetQuestion(int id)
        {
            var q = _context.Questions.FirstOrDefault(x => x.Id == id);

            if (q == null)
                return NotFound();

            return Ok(q);
        }
        [HttpPost("check")]
        public IActionResult CheckAnswer([FromBody] CheckDTO dto)
        {
            var question = _context.Questions.FirstOrDefault(q => q.Id == dto.QuestionId);

            if (question == null)
                return BadRequest("Питання не знайдено");

            bool isCorrect = false;

            if (question.Type == "test")
            {
                isCorrect = question.CorrectAnswer.Trim().ToLower()
                         == dto.Answer.Trim().ToLower();
            }

            if (question.Type == "code")
            {
                string Normalize(string str) =>
                    str.Replace(" ", "")
                       .Replace("\n", "")
                       .Replace("\r", "")
                       .Replace("\t", "")
                       .Replace(";", "")
                       .ToLower();

                isCorrect = Normalize(question.CorrectAnswer) == Normalize(dto.Answer);
            }

            return Ok(new
            {
                correct = isCorrect,
                correctAnswer = question.CorrectAnswer
            });
        }

        [HttpPut("{id}")]
        public IActionResult UpdateQuestion(int id, [FromBody] CreateQuestionDTO dto)
        {
            var q = _context.Questions.FirstOrDefault(x => x.Id == id);

            if (q == null)
                return NotFound("Питання не знайдено");

            var lessonExists = _context.Lessons.Any(l => l.Id == dto.LessonId);

            if (!lessonExists)
                return BadRequest("Невірний LessonId");

            q.Text = dto.Text;
            q.Type = dto.Type;
            q.OptionsJson = dto.OptionsJson;
            q.CorrectAnswer = dto.CorrectAnswer;
            q.LessonId = dto.LessonId;

            _context.SaveChanges();

            return Ok(q);
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteQuestion(int id)
        {
            var q = _context.Questions.FirstOrDefault(x => x.Id == id);

            if (q == null)
                return NotFound("Питання не знайдено");

            _context.Questions.Remove(q);
            _context.SaveChanges();

            return Ok("Питання видалено");
        }
    }
}