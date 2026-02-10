using Microsoft.AspNetCore.Mvc;
using EduVerse.API.DTOs;
using EduVerse.API.Services;
using Microsoft.AspNetCore.Authorization;
using EduVerse.API.Enums;
using System.Security.Claims;

namespace EduVerse.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DepartmentsController : BaseController
    {
        private readonly DepartmentService _departmentService;

        public DepartmentsController(DepartmentService departmentService)
        {
            _departmentService = departmentService;
        }

        [HttpGet]
        [Authorize(Roles = "1,2,3")]
        public async Task<IActionResult> GetAll()
        {
            var departments = await _departmentService.GetAllAsync(CurrentCollegeId);
            return Ok(new { data = departments });
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "1,2,3")]
        public async Task<IActionResult> GetById(int id)
        {
            var department = await _departmentService.GetByIdAsync(id, CurrentCollegeId);
            if (department == null) return NotFound();
            return Ok(new { data = department });
        }

        [HttpGet("public/{collegeId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetByCollegePublic(int collegeId)
        {
            var departments = await _departmentService.GetAllAsync(collegeId);
            return Ok(new { data = departments });
        }

        [HttpPost]
        [Authorize(Roles = "1")]
        public async Task<IActionResult> Create(CreateDepartmentDto dto)
        {
            var department = await _departmentService.CreateAsync(dto, CurrentCollegeId);
            return CreatedAtAction(nameof(GetById), new { id = department.Id }, new { data = department });
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "1")]
        public async Task<IActionResult> Update(int id, UpdateDepartmentDto dto)
        {
            var success = await _departmentService.UpdateAsync(id, dto, CurrentCollegeId);
            if (!success) return NotFound();

            var department = await _departmentService.GetByIdAsync(id, CurrentCollegeId);
            return Ok(new { data = department });
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "1")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _departmentService.DeleteAsync(id, CurrentCollegeId);
            if (!result) return NotFound();
            return NoContent();
        }
    }
}

