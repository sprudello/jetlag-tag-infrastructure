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

        [HttpPut]
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
    }
}
