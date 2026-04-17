using System.Text.Json.Serialization;

namespace api.Models
{
    public class Lesson
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Theory { get; set; }
        public int CourseId { get; set; }
        [JsonIgnore]
        public Course Course { get; set; }

    }
}
