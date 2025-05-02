using System.Text.Json.Serialization;

namespace tag_api.Models
{
    public class UserPenalty
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int PenaltyId { get; set; }
        public DateTime EndTime { get; set; }

        [JsonIgnore]
        public User User { get; set; }
        [JsonIgnore]
        public Penalty Penalty { get; set; }
    }
}
