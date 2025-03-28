﻿namespace tag_api.ModelsDTO
{
    // Used for GET responses.
    public class ChallengeCardDTO
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public int Reward { get; set; }
        public bool IsActive { get; set; }
    }
}
