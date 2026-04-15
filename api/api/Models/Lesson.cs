namespace api.Models
{
    public class Lesson
    {
        public int Id { get; set; }
        public string Title { get; set; }

        public List<Question> Questions { get; set; }
    }
}
