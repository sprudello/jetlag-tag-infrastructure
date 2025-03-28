namespace tag_api.ModelsDTO
{
    // Used for creating a new ChallengeCard.
    public class CreateChallengeCardDTO
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public int Reward { get; set; }
        public bool IsActive { get; set; }
    }
}
