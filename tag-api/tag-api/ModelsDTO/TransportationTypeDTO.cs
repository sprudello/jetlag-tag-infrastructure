namespace tag_api.ModelsDTO
{
    // Used for GET responses.
    public class TransportationTypeDTO
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public int PricePerMinute { get; set; }
        public bool IsActive { get; set; }
    }
}
