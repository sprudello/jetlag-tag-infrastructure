using System.Text.Json.Serialization;

namespace tag_api.Models
{
    public class Item
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; } = string.Empty;
        public int Price { get; set; }
        public bool IsActive { get; set; }

        [JsonIgnore]
        public ICollection<UserItem> UserItems { get; set; } = new List<UserItem>();
    }
}
