using System.Text.Json.Serialization;

namespace tag_api.Models
{
    public class Penalty
    {
        public int Id { get; set; }
        public int DurationInMinutes { get; set; }

        [JsonIgnore]
        public ICollection<UserPenalty> UserPenalties { get; set; } = new List<UserPenalty>();
    }
}
