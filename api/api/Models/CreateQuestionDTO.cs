namespace api.Models
{
    public class CreateQuestionDTO
    {
        public string Text { get; set; }
        public string Type { get; set; }
        public string OptionsJson { get; set; }
        public string CorrectAnswer { get; set; }
        public int LessonId { get; set; }
    }
}
