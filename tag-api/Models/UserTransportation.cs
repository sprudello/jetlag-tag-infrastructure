namespace tag_api.Models
{
    public class UserTransportation
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int TransportationId { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public int DurationInMinutes { get; set; }
        public int TotalCost { get; set; }

        //Relationships
        public User User { get; set; }
        public TransportationType TransportationType { get; set; }
    }
}
