using api.Models;

namespace api.Services
{
    public class CourseService
    {
        public bool CanUserAccessCourse(User user, Course course)
        {
            if (!course.IsFree)
                return false;

            return true;
        }
    }
}