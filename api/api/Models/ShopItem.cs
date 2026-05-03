namespace api.Models
{
    public class ShopItem
    {
        public int Id { get; set; }

        public string Name { get; set; }

        public string Type { get; set; }

        public int Price { get; set; }

        public int Value { get; set; }
        // напр. 100 діамантів

        public int? CourseId { get; set; } 
    }
}
