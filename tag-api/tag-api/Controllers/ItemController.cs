using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using tag_api.Data;
using tag_api.Models;
using tag_api.ModelsDTO;

namespace tag_api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ItemController : ControllerBase
    {
        private readonly DataContext _context;

        public ItemController(DataContext context)
        {
            _context = context;
        }

        // GET: api/item
        [HttpGet("/AllItems")]
        public async Task<ActionResult<IEnumerable<ItemDTO>>> GetItems()
        {
            var items = await _context.Items.Select(item => new ItemDTO
            {
                Id = item.Id,
                Name = item.Name,
                Description = item.Description,
                Price = item.Price,
                IsActive = item.IsActive
            }).ToListAsync();

            return Ok(items);
        }

        // GET: api/item/{id}
        [HttpGet("/Item/{id}")]
        public async Task<ActionResult<ItemDTO>> GetItem(int id)
        {
            var item = await _context.Items.FindAsync(id);
            if (item == null)
            {
                return NotFound();
            }

            var itemDto = new ItemDTO
            {
                Id = item.Id,
                Name = item.Name,
                Description = item.Description,
                Price = item.Price,
                IsActive = item.IsActive
            };

            return Ok(itemDto);
        }

        // POST: api/item
        [HttpPost("/createItem")]
        public async Task<ActionResult<ItemDTO>> CreateItem([FromBody] CreateItemDTO createDto)
        {
            var item = new Item
            {
                Name = createDto.Name,
                Description = createDto.Description,
                Price = createDto.Price,
                IsActive = createDto.IsActive
            };

            _context.Items.Add(item);
            await _context.SaveChangesAsync();

            var itemDto = new ItemDTO
            {
                Id = item.Id,
                Name = item.Name,
                Description = item.Description,
                Price = item.Price,
                IsActive = item.IsActive
            };

            return CreatedAtAction(nameof(GetItem), new { id = item.Id }, itemDto);
        }

        // PUT: api/item/{id}
        [HttpPut("/editItem/{id}")]
        public async Task<IActionResult> UpdateItem(int id, [FromBody] UpdateItemDTO updateDto)
        {
            var item = await _context.Items.FindAsync(id);
            if (item == null)
            {
                return NotFound();
            }

            item.Name = updateDto.Name;
            item.Description = updateDto.Description;
            item.Price = updateDto.Price;
            item.IsActive = updateDto.IsActive;

            _context.Entry(item).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Items.Any(e => e.Id == id))
                    return NotFound();
                else
                    throw;
            }

            return NoContent();
        }

        // DELETE: api/item/{id}
        [HttpDelete("/deleteItem/{id}")]
        public async Task<IActionResult> DeleteItem(int id)
        {
            var item = await _context.Items.FindAsync(id);
            if (item == null)
            {
                return NotFound();
            }

            _context.Items.Remove(item);
            await _context.SaveChangesAsync();

            return NoContent();
        }


    }
}
