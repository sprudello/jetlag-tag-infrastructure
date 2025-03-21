namespace tag_api.Models
{
    public class User
    {
        public int Id { get; set; }
        public required string Username { get; set; }
        public required string PasswordHash { get; set; }
        public required int Currency { get; set; }
        public DateTime PenaltyEndTime { get; set; }
    }
}
