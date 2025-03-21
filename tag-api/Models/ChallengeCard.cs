namespace tag_api.Models
{
    public class ChallengeCard
    {
        public int Id { get; set; }
        public required string Title { get; set; }
        public required string Description { get; set; }
        public required int Reward { get; set; }
        public required bool IsActive { get; set; }
    }
}
