namespace tag_api.Models
{
    public class Penalty
    {
        public int Id { get; set; }
        public int DurationInMinutes { get; set; }

        public ICollection<UserPenalty> UserPenalties { get; set; } = new List<UserPenalty>();
    }
}
