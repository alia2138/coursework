namespace api.Models
{
    public class Progress
    {
        public int Id { get; set; }

        public int UserId { get; set; } 
        public int LessonId { get; set; }

        public int CorrectAnswers { get; set; }
        public int TotalQuestions { get; set; }

        public int Percentage { get; set; }

        public bool IsCompleted { get; set; }

        public int Reward { get; set; }
    }
}
