namespace tag_api.Models
{
    public class TransportationType
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public required int PricePerMinute { get; set; }
    }
}
