using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduVerse.API.Migrations
{
    /// <inheritdoc />
    public partial class RemoveDepartmentIsActive : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "Departments");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "Departments",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);
        }
    }
}
