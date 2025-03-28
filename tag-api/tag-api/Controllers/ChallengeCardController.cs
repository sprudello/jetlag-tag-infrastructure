using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using tag_api.Data;
using tag_api.Models;
using tag_api.ModelsDTO;

namespace tag_api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChallengeCardController : ControllerBase
    {
        private readonly DataContext _context;

        public ChallengeCardController(DataContext context)
        {
            _context = context;
        }

        // GET: api/challengecard
        [HttpGet("/allChallenges")]
        public async Task<ActionResult<IEnumerable<ChallengeCardDTO>>> GetChallengeCards()
        {
            var cards = await _context.ChallengeCards
                .Select(card => new ChallengeCardDTO
                {
                    Id = card.Id,
                    Title = card.Title,
                    Description = card.Description,
                    Reward = card.Reward,
                    IsActive = card.IsActive
                })
                .ToListAsync();

            return Ok(cards);
        }

        // GET: api/challengecard/{id}
        [HttpGet("/challenge/{id}")]
        public async Task<ActionResult<ChallengeCardDTO>> GetChallengeCard(int id)
        {
            var card = await _context.ChallengeCards.FindAsync(id);
            if (card == null)
            {
                return NotFound();
            }

            var cardDto = new ChallengeCardDTO
            {
                Id = card.Id,
                Title = card.Title,
                Description = card.Description,
                Reward = card.Reward,
                IsActive = card.IsActive
            };

            return Ok(cardDto);
        }

        // POST: api/challengecard
        [HttpPost("/createChallenge")]
        public async Task<ActionResult<ChallengeCardDTO>> CreateChallengeCard([FromBody] CreateChallengeCardDTO createDto)
        {
            var card = new ChallengeCard
            {
                Title = createDto.Title,
                Description = createDto.Description,
                Reward = createDto.Reward,
                IsActive = createDto.IsActive
            };

            _context.ChallengeCards.Add(card);
            await _context.SaveChangesAsync();

            var cardDto = new ChallengeCardDTO
            {
                Id = card.Id,
                Title = card.Title,
                Description = card.Description,
                Reward = card.Reward,
                IsActive = card.IsActive
            };

            return CreatedAtAction(nameof(GetChallengeCard), new { id = card.Id }, cardDto);
        }

        // PUT: api/challengecard/{id}
        [HttpPut("/editChallenge/{id}")]
        public async Task<IActionResult> UpdateChallengeCard(int id, [FromBody] UpdateChallengeCardDTO updateDto)
        {
            var card = await _context.ChallengeCards.FindAsync(id);
            if (card == null)
            {
                return NotFound();
            }

            card.Title = updateDto.Title;
            card.Description = updateDto.Description;
            card.Reward = updateDto.Reward;
            card.IsActive = updateDto.IsActive;

            _context.Entry(card).State = EntityState.Modified;
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.ChallengeCards.Any(c => c.Id == id))
                    return NotFound();
                else
                    throw;
            }
            return NoContent();
        }

        // DELETE: api/challengecard/{id}
        [HttpDelete("/deleteChallenge/{id}")]
        public async Task<IActionResult> DeleteChallengeCard(int id)
        {
            var card = await _context.ChallengeCards.FindAsync(id);
            if (card == null)
            {
                return NotFound();
            }

            _context.ChallengeCards.Remove(card);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
