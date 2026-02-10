using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduVerse.API.Migrations
{

    public partial class RemoveClassroomFeatures : Migration
    {

        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "HasComputers",
                table: "Classrooms");

            migrationBuilder.DropColumn(
                name: "HasProjector",
                table: "Classrooms");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "Classrooms");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "HasComputers",
                table: "Classrooms",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "HasProjector",
                table: "Classrooms",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Type",
                table: "Classrooms",
                type: "varchar(50)",
                maxLength: 50,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }
    }
}

