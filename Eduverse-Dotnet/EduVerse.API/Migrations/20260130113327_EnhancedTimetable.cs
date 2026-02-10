using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduVerse.API.Migrations
{
    /// <inheritdoc />
    public partial class EnhancedTimetable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "BreakAfterPeriod",
                table: "TimeSlots",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "BreakDurationMinutes",
                table: "TimeSlots",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "PeriodDurationMinutes",
                table: "TimeSlots",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "TotalPeriods",
                table: "TimeSlots",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "ClassesPerWeek",
                table: "Subjects",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "ExpectedStudents",
                table: "Semesters",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BreakAfterPeriod",
                table: "TimeSlots");

            migrationBuilder.DropColumn(
                name: "BreakDurationMinutes",
                table: "TimeSlots");

            migrationBuilder.DropColumn(
                name: "PeriodDurationMinutes",
                table: "TimeSlots");

            migrationBuilder.DropColumn(
                name: "TotalPeriods",
                table: "TimeSlots");

            migrationBuilder.DropColumn(
                name: "ClassesPerWeek",
                table: "Subjects");

            migrationBuilder.DropColumn(
                name: "ExpectedStudents",
                table: "Semesters");
        }
    }
}
