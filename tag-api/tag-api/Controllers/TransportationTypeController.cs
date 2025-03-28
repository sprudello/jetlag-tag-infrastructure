using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using tag_api.Data;
using tag_api.Models;
using tag_api.ModelsDTO;

namespace tag_api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TransportationTypeController : ControllerBase
    {
        private readonly DataContext _context;

        public TransportationTypeController(DataContext context)
        {
            _context = context;
        }

        // GET: api/TransportationType
        [HttpGet("/allTransportationTypes")]
        public async Task<ActionResult<IEnumerable<TransportationTypeDTO>>> GetTransportationTypes()
        {
            var types = await _context.TransportationTypes
                .Select(t => new TransportationTypeDTO
                {
                    Id = t.Id,
                    Name = t.Name,
                    Description = t.Description,
                    PricePerMinute = t.PricePerMinute,
                    IsActive = t.IsActive
                })
                .ToListAsync();
            return Ok(types);
        }

        // GET: api/TransportationType/{id}
        [HttpGet("/transportationType/{id}")]
        public async Task<ActionResult<TransportationTypeDTO>> GetTransportationType(int id)
        {
            var type = await _context.TransportationTypes.FindAsync(id);
            if (type == null)
            {
                return NotFound();
            }

            var result = new TransportationTypeDTO
            {
                Id = type.Id,
                Name = type.Name,
                Description = type.Description,
                PricePerMinute = type.PricePerMinute,
                IsActive = type.IsActive
            };

            return Ok(result);
        }

        // POST: api/TransportationType
        [HttpPost("/createTransportationType")]
        public async Task<ActionResult<TransportationTypeDTO>> CreateTransportationType([FromBody] CreateTransportationTypeDTO createDto)
        {
            var type = new TransportationType
            {
                Name = createDto.Name,
                Description = createDto.Description,
                PricePerMinute = createDto.PricePerMinute,
                IsActive = createDto.IsActive
            };

            _context.TransportationTypes.Add(type);
            await _context.SaveChangesAsync();

            var result = new TransportationTypeDTO
            {
                Id = type.Id,
                Name = type.Name,
                Description = type.Description,
                PricePerMinute = type.PricePerMinute,
                IsActive = type.IsActive
            };

            return CreatedAtAction(nameof(GetTransportationType), new { id = type.Id }, result);
        }

        // PUT: api/TransportationType/{id}
        [HttpPut("/updateTransportationType/{id}")]
        public async Task<IActionResult> UpdateTransportationType(int id, [FromBody] UpdateTransportationTypeDTO updateDto)
        {
            var type = await _context.TransportationTypes.FindAsync(id);
            if (type == null)
            {
                return NotFound();
            }

            type.Name = updateDto.Name;
            type.Description = updateDto.Description;
            type.PricePerMinute = updateDto.PricePerMinute;
            type.IsActive = updateDto.IsActive;

            _context.Entry(type).State = EntityState.Modified;
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.TransportationTypes.Any(t => t.Id == id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }
            return NoContent();
        }

        // DELETE: api/TransportationType/{id}
        [HttpDelete("/deleteTransportationType/{id}")]
        public async Task<IActionResult> DeleteTransportationType(int id)
        {
            var type = await _context.TransportationTypes.FindAsync(id);
            if (type == null)
            {
                return NotFound();
            }

            _context.TransportationTypes.Remove(type);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
