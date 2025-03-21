namespace tag_api.Models
{
    public class ChallengeCard
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public int Reward { get; set; }
        public bool IsActive { get; set; }

        // Inverse navigation property
        public ICollection<UserChallenge> UserChallenges { get; set; } = new List<UserChallenge>();
    }
}
