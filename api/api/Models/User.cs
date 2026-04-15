namespace api.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }

        public int Hearts { get; set; } = 5;
        public int Diamonds { get; set; } = 100;
        public int Streak { get; set; } = 0;
    }
}
