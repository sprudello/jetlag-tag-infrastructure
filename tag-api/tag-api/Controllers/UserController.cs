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
                Username = u.Username,
                Currency = u.Currency,
                IsAdmin = u.IsAdmin
            }).ToListAsync();

            return Ok(response);
        }
    }
}
