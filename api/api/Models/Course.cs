using System.Text.Json.Serialization;

namespace api.Models
{
    public class Course
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public bool IsFree { get; set; }

        [JsonIgnore] 
        public List<Lesson>? Lessons { get; set; } = new List<Lesson>();
        public List<UserCourse>? UserCourses { get; set; } 
    }
}