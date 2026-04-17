using api.Data;
using api.Models;
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

        [HttpPost("check")]
        public IActionResult CheckAnswer(int questionId, string answer)
        {
            var question = _context.Questions.FirstOrDefault(q => q.Id == questionId);

            if (question == null)
                return BadRequest("Питання не знайдено");

            bool isCorrect = question.CorrectAnswer.Trim().ToLower()
                           == answer.Trim().ToLower();

            return Ok(new
            {
                correct = isCorrect,
                correctAnswer = question.CorrectAnswer
            });
        }
    }
}
