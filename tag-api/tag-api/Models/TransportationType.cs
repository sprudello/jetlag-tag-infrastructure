using System.Text.Json.Serialization;

namespace tag_api.Models
{
    public class TransportationType
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; } = string.Empty;
        public int PricePerMinute { get; set; }
        public bool IsActive { get; set; }

        [JsonIgnore]
        public ICollection<UserTransportation> UserTransportations { get; set; } = new List<UserTransportation>();
    }
}
