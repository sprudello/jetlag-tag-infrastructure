using System.Text.Json.Serialization;

namespace tag_api.Models
{
    public class User
    {
        public int Id { get; set; }
        public required string Username { get; set; }
        public required string PasswordHash { get; set; }
        public required int Currency { get; set; }
        public required bool IsAdmin { get; set; }

        [JsonIgnore]
        public ICollection<UserChallenge> UserChallenges { get; set; } = new List<UserChallenge>();
        [JsonIgnore]
        public ICollection<UserItem> UserItems { get; set; } = new List<UserItem>();
        [JsonIgnore]
        public ICollection<UserPenalty> UserPenalties { get; set; } = new List<UserPenalty>();
        [JsonIgnore]
        public ICollection<UserTransportation> UserTransportations { get; set; } = new List<UserTransportation>();
    }
}
