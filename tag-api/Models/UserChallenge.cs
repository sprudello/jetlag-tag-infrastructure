namespace tag_api.Models
{
    public class UserChallenge
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int CardId { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public bool HasMultiplier { get; set; }
        public ChallengeStatus Status { get; set; }

        //Relationships
        public User User { get; set; }
        public ChallengeCard ChallengeCard { get; set; }
    }
    public enum ChallengeStatus
    {
        InProgress,
        Completed,
        Failed
    }
}

