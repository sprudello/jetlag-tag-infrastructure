using System.Text.Json.Serialization;

namespace tag_api.Models
{
    public class UserItem
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int ItemId { get; set; }
        public DateTime PurchaseDate { get; set; }

        [JsonIgnore]
        public User User { get; set; }
        [JsonIgnore]
        public Item Item { get; set; }
    }
}
