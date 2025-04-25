using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using tag_api.Data;
using tag_api.Models;
using tag_api.ModelsDTO;

namespace tag_api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PenaltyController : ControllerBase
    {
        private readonly DataContext _context;

        public PenaltyController(DataContext context)
        {
            _context = context;
        }

        [HttpPut("/EditPenalty")]
        public async Task<IActionResult> UpdatePenalty([FromBody] PenaltyDTO penaltyDto)
        {
            if (penaltyDto == null)
                return BadRequest("Invalid data.");

            // Retrieve the only penalty record (if exists)
            var penalty = await _context.Penalties.FirstOrDefaultAsync();

            if (penalty == null)
            {
                // Create new penalty if none exists
                penalty = new Penalty
                {
                    DurationInMinutes = penaltyDto.DurationInMinutes
                };
                _context.Penalties.Add(penalty);
            }
            else
            {
                // Update the existing penalty
                penalty.DurationInMinutes = penaltyDto.DurationInMinutes;
                _context.Penalties.Update(penalty);
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Penalty updated successfully", penalty });
        }
        [HttpGet("/GetUserPenalty/{userId}")]
        public async Task<IActionResult> GetUserPenalty(int userId)
        {
            if (userId <= 0)
                return BadRequest("Invalid user ID");
        
            // Find the active penalty for the user (where EndTime is in the future)
            var userPenalty = await _context.UserPenalties
                .Include(up => up.Penalty)
                .Where(up => up.UserId == userId && up.EndTime > DateTime.UtcNow)
                .OrderByDescending(up => up.EndTime)  // Get the one that ends last if multiple
                .FirstOrDefaultAsync();
        
            if (userPenalty == null)
                return NotFound("No active penalty found for this user.");
        
            return Ok(new { 
                endTime = userPenalty.EndTime,
                durationInMinutes = userPenalty.Penalty.DurationInMinutes,
                remainingMinutes = Math.Round((userPenalty.EndTime - DateTime.UtcNow).TotalMinutes, 2)
            });
        }
    }
    
}
