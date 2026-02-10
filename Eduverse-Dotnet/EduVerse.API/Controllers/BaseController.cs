using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EduVerse.API.Controllers
{
    public class BaseController : ControllerBase
    {
        protected int CurrentCollegeId => int.Parse(User.FindFirst("CollegeId")?.Value ?? "0");
        protected int CurrentUserId => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        protected string CurrentUserRole => User.FindFirst(ClaimTypes.Role)?.Value ?? string.Empty;
    }
}

