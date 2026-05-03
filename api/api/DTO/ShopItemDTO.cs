namespace api.DTO
{
    public class ShopItemDTO
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Type { get; set; }
        public int Price { get; set; }
        public int Value { get; set; }
        public int? CourseId { get; set; }
    }
}
