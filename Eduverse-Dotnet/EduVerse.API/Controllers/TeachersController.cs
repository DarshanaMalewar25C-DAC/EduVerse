using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EduVerse.API.DTOs;
using EduVerse.API.Services;

namespace EduVerse.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TeachersController : BaseController
    {
        private readonly UserService _service;

        public TeachersController(UserService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _service.GetTeachersAsync(CurrentCollegeId);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _service.GetByIdAsync(id, CurrentCollegeId);
            if (result == null || result.RoleId != 3) return NotFound();

            return Ok(result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateUserDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var existing = await _service.GetByIdAsync(id, CurrentCollegeId);
            if (existing == null || existing.RoleId != 3) return NotFound();

            var success = await _service.UpdateAsync(id, dto, CurrentCollegeId);
            if (!success) return NotFound();

            return NoContent();
        }
    }
}

