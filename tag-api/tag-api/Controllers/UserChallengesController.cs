using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using tag_api.Data;
using tag_api.Models;
using tag_api.ModelsDTO;

namespace tag_api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserChallengesController : ControllerBase
    {
        private readonly DataContext _context;

        public UserChallengesController(DataContext context)
        {
            _context = context;
        }

        // GET: api/UserChallenges/pullCard/{userId}
        [HttpGet("/pullCard/{userId}")]
        public async Task<IActionResult> PullCard(int userId)
        {
            // Check for active penalty.
            bool hasActivePenalty = await _context.UserPenalties
                .AnyAsync(up => up.UserId == userId && up.EndTime > DateTime.UtcNow);
            if (hasActivePenalty)
                return BadRequest("Action blocked due to active penalty.");

            // Retrieve IDs of cards already pulled by the user.
            var pulledCardIds = await _context.UserChallenges
                .Where(uc => uc.UserId == userId)
                .Select(uc => uc.CardId)
                .ToListAsync();

            // Get active cards the user has not pulled.
            var availableCards = await _context.ChallengeCards
                .Where(c => c.IsActive && !pulledCardIds.Contains(c.Id))
                .ToListAsync();

            if (!availableCards.Any())
                return NotFound("No new challenge cards available.");

            // Pick a random card.
            var random = new Random();
            var card = availableCards[random.Next(availableCards.Count)];

            // Create a new user challenge record.
            var userChallenge = new UserChallenge
            {
                UserId = userId,
                CardId = card.Id,
                StartTime = DateTime.UtcNow,
                EndTime = DateTime.UtcNow, // Will update on success/fail.
                HasMultiplier = false,
                Status = ChallengeStatus.InProgress
            };

            _context.UserChallenges.Add(userChallenge);
            await _context.SaveChangesAsync();

            return Ok(new { userChallengeId = userChallenge.Id, card });
        }

        // POST: api/UserChallenges/success
        [HttpPost("/success")]
        public async Task<IActionResult> CompleteChallengeSuccess([FromBody] CompleteChallengeRequestDTO request)
        {
            // Check for active penalty.
            bool hasActivePenalty = await _context.UserPenalties
                .AnyAsync(up => up.UserId == request.UserId && up.EndTime > DateTime.UtcNow);
            if (hasActivePenalty)
                return BadRequest("Action blocked due to active penalty.");

            var userChallenge = await _context.UserChallenges
                .Include(uc => uc.ChallengeCard)
                .FirstOrDefaultAsync(uc => uc.Id == request.UserChallengeId);

            if (userChallenge == null)
                return NotFound("User challenge not found.");

            if (userChallenge.Status != ChallengeStatus.InProgress)
                return BadRequest("Challenge is already completed or failed.");

            // Mark the challenge as completed and update the end time.
            userChallenge.Status = ChallengeStatus.Completed;
            userChallenge.EndTime = DateTime.UtcNow;

            // Update the user's currency with the challenge card reward.
            var user = await _context.Users.FindAsync(userChallenge.UserId);
            if (user == null)
                return NotFound("User not found.");

            user.Currency += userChallenge.ChallengeCard.Reward;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Challenge completed successfully.", newCurrency = user.Currency });
        }

        // POST: api/UserChallenges/fail
        [HttpPost("/fail")]
        public async Task<IActionResult> CompleteChallengeFail([FromBody] FailChallengeRequestDTO request)
        {
            // Check for active penalty.
            bool hasActivePenalty = await _context.UserPenalties
                .AnyAsync(up => up.UserId == request.UserId && up.EndTime > DateTime.UtcNow);
            if (hasActivePenalty)
                return BadRequest("Action blocked due to active penalty.");

            var userChallenge = await _context.UserChallenges.FirstOrDefaultAsync(uc => uc.Id == request.UserChallengeId);
            if (userChallenge == null)
                return NotFound("User challenge not found.");

            if (userChallenge.Status != ChallengeStatus.InProgress)
                return BadRequest("Challenge is already completed or failed.");

            // Mark the challenge as failed and update the end time.
            userChallenge.Status = ChallengeStatus.Failed;
            userChallenge.EndTime = DateTime.UtcNow;

            // Retrieve a penalty record (assuming one exists).
            var penalty = await _context.Penalties.FirstOrDefaultAsync();
            if (penalty == null)
                return NotFound("Penalty record not found.");

            // Create a new UserPenalty record.
            var userPenalty = new UserPenalty
            {
                UserId = userChallenge.UserId,
                PenaltyId = penalty.Id,
                EndTime = DateTime.UtcNow.AddMinutes(penalty.DurationInMinutes)
            };

            _context.UserPenalties.Add(userPenalty);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Challenge failed. Penalty applied." });
        }

        // GET: api/UserChallenges/challengeCounts/{userId}
        [HttpGet("/challengeCounts/{userId}")]
        public async Task<IActionResult> GetChallengeCounts(int userId)
        {
            // Note: You might decide not to block reporting stats even if there is an active penalty.
            var successCount = await _context.UserChallenges
                .CountAsync(uc => uc.UserId == userId && uc.Status == ChallengeStatus.Completed);

            var failedCount = await _context.UserChallenges
                .CountAsync(uc => uc.UserId == userId && uc.Status == ChallengeStatus.Failed);

            return Ok(new { successCount, failedCount });
        }
    }
}
