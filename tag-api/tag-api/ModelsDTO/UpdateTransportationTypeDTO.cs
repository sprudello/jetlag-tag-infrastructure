namespace tag_api.ModelsDTO
{
    // Used for updating an existing TransportationType.
    public class UpdateTransportationTypeDTO
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public int PricePerMinute { get; set; }
        public bool IsActive { get; set; }
    }
}
