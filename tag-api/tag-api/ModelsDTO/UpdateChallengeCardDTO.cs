namespace tag_api.ModelsDTO
{
    // Used for updating an existing ChallengeCard.
    public class UpdateChallengeCardDTO
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public int Reward { get; set; }
        public bool IsActive { get; set; }
    }
}
