using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using tag_api.Data;
using tag_api.Models;
using tag_api.ModelsDTO;

namespace tag_api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserItemsController : ControllerBase
    {
        private readonly DataContext _context;

        public UserItemsController(DataContext context)
        {
            _context = context;
        }

        // POST: api/UserItems/buy
        [HttpPost("/buy")]
        public async Task<IActionResult> BuyItem([FromBody] UserItemDTO request)
        {
            // Check for active penalty.
            bool hasActivePenalty = await _context.UserPenalties
                .AnyAsync(up => up.UserId == request.UserId && up.EndTime > DateTime.UtcNow);
            if (hasActivePenalty)
                return BadRequest("Action blocked due to active penalty.");

            // Validate input
            if (request.UserId <= 0 || request.ItemId <= 0)
                return BadRequest("Invalid user or item ID.");

            // Retrieve the user.
            var user = await _context.Users.FindAsync(request.UserId);
            if (user == null)
                return NotFound("User not found.");

            // Retrieve the item (and ensure it's active).
            var item = await _context.Items.FirstOrDefaultAsync(i => i.Id == request.ItemId && i.IsActive);
            if (item == null)
                return NotFound("Item not found or inactive.");

            // Check if the user has enough currency.
            if (user.Currency < item.Price)
                return BadRequest("Insufficient currency to purchase item.");

            // Deduct the item's price from the user's currency.
            user.Currency -= item.Price;

            // Create a new UserItem record for the purchase.
            var userItem = new UserItem
            {
                UserId = request.UserId,
                ItemId = request.ItemId,
                PurchaseDate = DateTime.UtcNow
            };

            _context.UserItems.Add(userItem);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Item purchased successfully.",
                remainingCurrency = user.Currency,
                purchasedItem = userItem
            });
        }
        // GET: api/UserItems/user/{userId}
        [HttpGet("GetAllUserItems/{userId}")]
        public async Task<IActionResult> GetUserItems(int userId)
        {
            // Validate input
            if (userId <= 0)
                return BadRequest("Invalid user ID.");

            // Check if the user exists
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return NotFound("User not found.");

            // Retrieve all items owned by the user, including the item details
            var userItems = await _context.UserItems
                .Where(ui => ui.UserId == userId)
                .Include(ui => ui.Item)
                .Select(ui => new
                {
                    ui.Id,
                    ui.ItemId,
                    ui.PurchaseDate,
                    Item = new
                    {
                        ui.Item.Id,
                        ui.Item.Name,
                        ui.Item.Description,
                        ui.Item.Price,
                        ui.Item.IsActive
                    }
                })
                .ToListAsync();

            return Ok(userItems);
        }
    }
}
