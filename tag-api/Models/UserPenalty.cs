namespace tag_api.Models
{
    public class UserPenalty
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int PenaltyId { get; set; }
        public DateTime EndTime { get; set; }

        //Relationships
        public User User { get; set; }
        public Penalty Penalty { get; set; }
    }
}
