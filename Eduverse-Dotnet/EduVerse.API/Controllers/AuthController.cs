using Microsoft.AspNetCore.Mvc;
using EduVerse.API.DTOs;
using EduVerse.API.Services;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

namespace EduVerse.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;

        public AuthController(AuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register-college")]
        public async Task<IActionResult> RegisterCollege([FromBody] CollegeRegistrationRequest request)
        {
            try
            {
                var (success, message, _) = await _authService.RegisterCollegeAsync(request);

                if (!success)
                    return BadRequest(new { message });

                return Ok(new { message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new {
                    message = "Internal server error occurred",
                    error = ex.Message
                });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var (success, message, response) = await _authService.LoginAsync(request);

            if (!success)
                return Unauthorized(new { message });

            return Ok(new { message, data = response });
        }

        [HttpPost("verify-email")]
        public async Task<IActionResult> VerifyEmail([FromBody] VerifyOtpRequest request)
        {
            var (success, message) = await _authService.VerifyEmailOtpAsync(request);
            if (!success)
                return BadRequest(new { message });

            return Ok(new { message });
        }

        [HttpPost("send-registration-otp")]
        [AllowAnonymous]
        public async Task<IActionResult> SendRegistrationOtp([FromBody] SendOtpRequest request)
        {
            var (success, message) = await _authService.SendRegistrationOtpAsync(request);
            if (!success)
                return BadRequest(new { message });

            return Ok(new { message });
        }

        [HttpPost("verify-registration-otp")]
        [AllowAnonymous]
        public async Task<IActionResult> VerifyRegistrationOtp([FromBody] VerifyOtpRequest request)
        {
            var (success, message) = await _authService.VerifyRegistrationOtpAsync(request);
            if (!success)
                return BadRequest(new { message });

            return Ok(new { message });
        }

        [HttpPost("verify-2fa")]
        public async Task<IActionResult> Verify2FA([FromBody] VerifyOtpRequest request)
        {
            var (success, message, response) = await _authService.Verify2FAOtpAsync(request);
            if (!success)
                return BadRequest(new { message });

            return Ok(new { message, data = response });
        }

        [HttpPost("register-user")]
        [Authorize(Roles = "1,4")]
        public async Task<IActionResult> RegisterUser([FromBody] UserRegistrationRequest request)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var (success, message) = await _authService.RegisterUserAsync(request, userId);

            if (!success)
                return BadRequest(new { message });

            return Ok(new { message });
        }

        [HttpPost("register-public-user")]
        [AllowAnonymous]
        public async Task<IActionResult> RegisterPublicUser([FromBody] PublicUserRegistrationRequest request)
        {
            var (success, message) = await _authService.RegisterPublicUserAsync(request);

            if (!success)
                return BadRequest(new { message });

            return Ok(new { message });
        }

        [HttpGet("colleges")]
        [AllowAnonymous]
        public async Task<IActionResult> GetColleges()
        {
            var colleges = await _authService.GetActiveCollegesAsync();
            return Ok(new { data = colleges });
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            var (success, message) = await _authService.ForgotPasswordAsync(request);
            return Ok(new { message });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            var (success, message) = await _authService.ResetPasswordAsync(request);

            if (!success)
                return BadRequest(new { message });

            return Ok(new { message });
        }

        [HttpGet("pending-colleges")]
        [Authorize(Roles = "4")]
        public async Task<IActionResult> GetPendingColleges()
        {
            var pendingColleges = await _authService.GetPendingCollegesAsync();
            return Ok(new { data = pendingColleges });
        }

        [HttpGet("all-colleges")]
        [Authorize(Roles = "4")]
        public async Task<IActionResult> GetAllColleges()
        {
            var colleges = await _authService.GetAllCollegesAsync();
            return Ok(new { data = colleges });
        }

        [HttpGet("pending-users")]
        [Authorize(Roles = "1")]
        public async Task<IActionResult> GetPendingUsers()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var pendingUsers = await _authService.GetPendingUsersAsync(userId);
            return Ok(new { data = pendingUsers });
        }

        [HttpPost("approve-college")]
        [Authorize(Roles = "4")]
        public async Task<IActionResult> ApproveCollege([FromBody] ApprovalRequest request)
        {
            var (success, message) = await _authService.ApproveCollegeAsync(request);

            if (!success)
                return BadRequest(new { message });

            return Ok(new { message });
        }

        [HttpPost("approve-user")]
        [Authorize(Roles = "1")]
        public async Task<IActionResult> ApproveUser([FromBody] ApprovalRequest request)
        {
            var (success, message) = await _authService.ApproveUserAsync(request);

            if (!success)
                return BadRequest(new { message });

            return Ok(new { message });
        }

        [HttpGet("me")]
        [Authorize]
        public IActionResult GetCurrentUser()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            var name = User.FindFirst(ClaimTypes.Name)?.Value;
            var role = User.FindFirst("RoleName")?.Value;
            var collegeId = User.FindFirst("CollegeId")?.Value;
            var collegeCode = User.FindFirst("CollegeCode")?.Value;

            return Ok(new
            {
                userId,
                email,
                name,
                role,
                collegeId,
                collegeCode
            });
        }
    }
}

