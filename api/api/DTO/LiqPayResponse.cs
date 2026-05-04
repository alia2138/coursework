namespace api.DTO
{
    public class LiqPayResponse
    {
        public string status { get; set; }
        public string order_id { get; set; }
        public double amount { get; set; }
        public string currency { get; set; }
        public string description { get; set; }
    }
}
