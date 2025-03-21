namespace tag_api.Models
{
    public class TransportationType
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public string Description { get; set; } = string.Empty;
        public required int PricePerMinute { get; set; }
        public required bool IsActive { get; set; }
    }
}
