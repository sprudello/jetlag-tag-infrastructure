namespace tag_api.ModelsDTO
{
    // Used for creating a new TransportationType.
    public class CreateTransportationTypeDTO
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public int PricePerMinute { get; set; }
        public bool IsActive { get; set; }
    }
}
