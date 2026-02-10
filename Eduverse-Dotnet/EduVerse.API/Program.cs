using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using EduVerse.API.Data;
using EduVerse.API.Services;
using System.Security.Claims;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(options => {
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    });
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "EduVerse API",
        Version = "v1",
        Description = "Class Scheduling System API"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

var jwtKey = builder.Configuration["Jwt:Key"] ?? "eyJhbGciOiJIUzI1NiJ9.eyJSb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJJc3N1ZXIiLCJVc2VybmFtZSI6IkphdmFJblVzZSIsImV4cCI6MTc2NjQ3NjQwMCwiaWF0IjoxNzY2NDc2NDAwfQ";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "EduVerse";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "EduVerse";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        RoleClaimType = ClaimTypes.Role
    };
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<TimetableGenerationService>();
builder.Services.AddScoped<ClassroomService>();
builder.Services.AddScoped<DepartmentService>();
builder.Services.AddScoped<SemesterService>();
builder.Services.AddScoped<SubjectService>();
builder.Services.AddScoped<TimeSlotService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<UserService>();

var app = builder.Build();
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    await SeedSuperAdmins(context);
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "EduVerse API V1");
    });
}

app.UseCors("AllowReactApp");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

static async Task SeedSuperAdmins(ApplicationDbContext context)
{
    try
    {
        await context.Database.EnsureCreatedAsync();

        var superAdminRole = await context.Roles.FirstOrDefaultAsync(r => r.Id == 4);
        if (superAdminRole == null)
        {
            superAdminRole = new EduVerse.API.Models.Role
            {
                Id = 4,
                Name = "SuperAdmin",
                Description = "Super Admin"
            };
            context.Roles.Add(superAdminRole);
            await context.SaveChangesAsync();
        }

        var superAdminCollege = await context.Colleges.FirstOrDefaultAsync(c => c.CollegeCode == "SUPERADMIN");
        if (superAdminCollege == null)
        {
            superAdminCollege = new EduVerse.API.Models.College
            {
                CollegeName = "EduVerse System",
                CollegeCode = "SUPERADMIN",
                Address = "System",
                State = "System",
                IsActive = true,
                IsApproved = true,
                CreatedAt = DateTime.UtcNow
            };
            context.Colleges.Add(superAdminCollege);
            await context.SaveChangesAsync();
        }

        var superAdmin1Email = "superadmin1@eduverse.com";
        var superAdmin2Email = "superadmin2@eduverse.com";

        if (!await context.Users.AnyAsync(u => u.Email == superAdmin1Email))
        {
            var superAdmin1 = new EduVerse.API.Models.User
            {
                CollegeId = superAdminCollege.Id,
                FullName = "Super Admin 1",
                Email = superAdmin1Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("SuperAdmin@123"),
                RoleId = 4,
                IsActive = true,
                IsApproved = true,
                CreatedAt = DateTime.UtcNow
            };
            context.Users.Add(superAdmin1);
        }

        if (!await context.Users.AnyAsync(u => u.Email == superAdmin2Email))
        {
            var superAdmin2 = new EduVerse.API.Models.User
            {
                CollegeId = superAdminCollege.Id,
                FullName = "Super Admin 2",
                Email = superAdmin2Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("SuperAdmin@123"),
                RoleId = 4,
                IsActive = true,
                IsApproved = true,
                CreatedAt = DateTime.UtcNow
            };
            context.Users.Add(superAdmin2);
        }

        await context.SaveChangesAsync();
        Console.WriteLine("SuperAdmin users seeded successfully");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error seeding SuperAdmins: {ex.Message}");
    }
}

