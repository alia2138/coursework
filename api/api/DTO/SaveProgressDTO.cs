namespace api.DTO
{
    public class SaveProgressDTO
    {
        public int UserId { get; set; }
        public int LessonId { get; set; }
        public int CorrectAnswers { get; set; }
        public int TotalQuestions { get; set; }
    }
}
