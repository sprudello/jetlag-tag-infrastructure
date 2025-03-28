using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using tag_api.Data;
using tag_api.Models;
using tag_api.ModelsDTO;

namespace tag_api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserTransportationsController : ControllerBase
    {
        private readonly DataContext _context;

        public UserTransportationsController(DataContext context)
        {
            _context = context;
        }

        // POST: api/UserTransportations/buy
        [HttpPost("/buyTransportation")]
        public async Task<IActionResult> PurchaseTransportation([FromBody] PurchaseTransportationDTO request)
        {
            // Validate the request.
            if (request.DurationInMinutes <= 0)
                return BadRequest("Duration must be greater than zero.");

            // Retrieve the user.
            var user = await _context.Users.FindAsync(request.UserId);
            if (user == null)
                return NotFound("User not found.");

            // Retrieve the active transportation type.
            var transportation = await _context.TransportationTypes
                .FirstOrDefaultAsync(t => t.Id == request.TransportationTypeId && t.IsActive);
            if (transportation == null)
                return NotFound("Transportation type not found or inactive.");

            // Calculate the total cost.
            var totalCost = transportation.PricePerMinute * request.DurationInMinutes;

            // Check if the user has enough currency.
            if (user.Currency < totalCost)
                return BadRequest("Insufficient currency.");

            // Deduct the cost from the user's currency.
            user.Currency -= totalCost;

            // Create a new UserTransportation record.
            var startTime = DateTime.UtcNow;
            var endTime = startTime.AddMinutes(request.DurationInMinutes);
            var userTransportation = new UserTransportation
            {
                UserId = request.UserId,
                TransportationId = request.TransportationTypeId,
                StartTime = startTime,
                EndTime = endTime,
                DurationInMinutes = request.DurationInMinutes,
                TotalCost = totalCost
            };

            _context.UserTransportations.Add(userTransportation);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Transportation purchased successfully.",
                transaction = userTransportation,
                remainingCurrency = user.Currency
            });
        }
    }
}