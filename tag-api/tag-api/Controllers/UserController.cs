using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using tag_api.Data;
using tag_api.ModelsDTO;

namespace tag_api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly DataContext _context;

        public UserController(DataContext context)
        {
            _context = context;
        }

        [HttpGet("/allUsers")]
        public async Task<ActionResult<UserDataDTO>> GetAllUsers()
        {
            var response = await _context.Users.Select(u => new UserDataDTO
            {
                Id = u.Id,
                Username = u.Username,
                Currency = u.Currency,
                IsAdmin = u.IsAdmin
            }).ToListAsync();

            return Ok(response);
        }
        [HttpPut("/editUser/{id}")]
        // [Authorize(Roles = "Admin")] // Uncomment if using JWT and role-based authorization
        public async Task<IActionResult> EditUser(int id, [FromBody] EditUserDTO editDto)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound("User not found.");
            }

            // Update properties based on the input DTO.
            user.Username = editDto.Username;
            user.Currency = editDto.Currency;
            user.IsAdmin = editDto.IsAdmin;

            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "User updated successfully." });
        }
    }
}
