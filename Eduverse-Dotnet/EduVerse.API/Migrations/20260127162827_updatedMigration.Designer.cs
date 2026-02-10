using System;
using EduVerse.API.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

#nullable disable

namespace EduVerse.API.Migrations
{
    [DbContext(typeof(ApplicationDbContext))]
    [Migration("20260127162827_updatedMigration")]
    partial class updatedMigration
    {

        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "8.0.2")
                .HasAnnotation("Relational:MaxIdentifierLength", 64);

            MySqlModelBuilderExtensions.AutoIncrementColumns(modelBuilder);

            modelBuilder.Entity("EduVerse.API.Models.Classroom", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    MySqlPropertyBuilderExtensions.UseMySqlIdentityColumn(b.Property<int>("Id"));

                    b.Property<string>("Building")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("varchar(100)");

                    b.Property<int>("Capacity")
                        .HasColumnType("int");

                    b.Property<int>("CollegeId")
                        .HasColumnType("int");

                    b.Property<bool>("HasComputers")
                        .HasColumnType("tinyint(1)");

                    b.Property<bool>("HasProjector")
                        .HasColumnType("tinyint(1)");

                    b.Property<bool>("IsActive")
                        .HasColumnType("tinyint(1)");

                    b.Property<string>("RoomNumber")
                        .IsRequired()
                        .HasMaxLength(50)
                        .HasColumnType("varchar(50)");

                    b.Property<string>("Type")
                        .HasMaxLength(50)
                        .HasColumnType("varchar(50)");

                    b.HasKey("Id");

                    b.HasIndex("CollegeId", "Building", "RoomNumber")
                        .IsUnique();

                    b.ToTable("Classrooms");
                });

            modelBuilder.Entity("EduVerse.API.Models.College", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    MySqlPropertyBuilderExtensions.UseMySqlIdentityColumn(b.Property<int>("Id"));

                    b.Property<string>("Address")
                        .HasMaxLength(500)
                        .HasColumnType("varchar(500)");

                    b.Property<string>("CollegeCode")
                        .IsRequired()
                        .HasMaxLength(20)
                        .HasColumnType("varchar(20)");

                    b.Property<string>("CollegeName")
                        .IsRequired()
                        .HasMaxLength(200)
                        .HasColumnType("varchar(200)");

                    b.Property<string>("ContactEmail")
                        .HasMaxLength(100)
                        .HasColumnType("varchar(100)");

                    b.Property<string>("ContactPhone")
                        .HasMaxLength(20)
                        .HasColumnType("varchar(20)");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("datetime(6)");

                    b.Property<int?>("EstablishedYear")
                        .HasColumnType("int");

                    b.Property<bool>("IsActive")
                        .HasColumnType("tinyint(1)");

                    b.Property<bool>("IsApproved")
                        .HasColumnType("tinyint(1)");

                    b.Property<string>("State")
                        .HasMaxLength(100)
                        .HasColumnType("varchar(100)");

                    b.HasKey("Id");

                    b.HasIndex("CollegeCode")
                        .IsUnique();

                    b.ToTable("Colleges");
                });

            modelBuilder.Entity("EduVerse.API.Models.Constraint", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    MySqlPropertyBuilderExtensions.UseMySqlIdentityColumn(b.Property<int>("Id"));

                    b.Property<int>("CollegeId")
                        .HasColumnType("int");

                    b.Property<string>("ConstraintRule")
                        .HasMaxLength(50)
                        .HasColumnType("varchar(50)");

                    b.Property<string>("Description")
                        .HasMaxLength(500)
                        .HasColumnType("varchar(500)");

                    b.Property<int?>("EntityId")
                        .HasColumnType("int");

                    b.Property<bool>("IsActive")
                        .HasColumnType("tinyint(1)");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("varchar(100)");

                    b.Property<int>("Priority")
                        .HasColumnType("int");

                    b.Property<string>("Type")
                        .IsRequired()
                        .HasMaxLength(50)
                        .HasColumnType("varchar(50)");

                    b.Property<int?>("Value")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.HasIndex("CollegeId");

                    b.ToTable("Constraints");
                });

            modelBuilder.Entity("EduVerse.API.Models.Department", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    MySqlPropertyBuilderExtensions.UseMySqlIdentityColumn(b.Property<int>("Id"));

                    b.Property<string>("Code")
                        .IsRequired()
                        .HasMaxLength(10)
                        .HasColumnType("varchar(10)");

                    b.Property<int>("CollegeId")
                        .HasColumnType("int");

                    b.Property<string>("Description")
                        .HasMaxLength(500)
                        .HasColumnType("varchar(500)");

                    b.Property<bool>("IsActive")
                        .HasColumnType("tinyint(1)");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("varchar(100)");

                    b.HasKey("Id");

                    b.HasIndex("CollegeId", "Code")
                        .IsUnique();

                    b.ToTable("Departments");
                });

            modelBuilder.Entity("EduVerse.API.Models.FixedClass", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    MySqlPropertyBuilderExtensions.UseMySqlIdentityColumn(b.Property<int>("Id"));

                    b.Property<int?>("ClassroomId")
                        .HasColumnType("int");

                    b.Property<string>("Description")
                        .HasMaxLength(200)
                        .HasColumnType("varchar(200)");

                    b.Property<bool>("IsActive")
                        .HasColumnType("tinyint(1)");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("varchar(100)");

                    b.Property<int>("SubjectId")
                        .HasColumnType("int");

                    b.Property<int?>("TeacherId")
                        .HasColumnType("int");

                    b.Property<int>("TimeSlotId")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.HasIndex("ClassroomId");

                    b.HasIndex("SubjectId");

                    b.HasIndex("TeacherId");

                    b.HasIndex("TimeSlotId");

                    b.ToTable("FixedClasses");
                });

            modelBuilder.Entity("EduVerse.API.Models.Role", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    MySqlPropertyBuilderExtensions.UseMySqlIdentityColumn(b.Property<int>("Id"));

                    b.Property<string>("Description")
                        .HasMaxLength(200)
                        .HasColumnType("varchar(200)");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasMaxLength(50)
                        .HasColumnType("varchar(50)");

                    b.HasKey("Id");

                    b.HasIndex("Name")
                        .IsUnique();

                    b.ToTable("Roles");

                    b.HasData(
                        new
                        {
                            Id = 1,
                            Description = "College Administrator",
                            Name = "Admin"
                        },
                        new
                        {
                            Id = 2,
                            Description = "Head of Department",
                            Name = "HOD"
                        },
                        new
                        {
                            Id = 3,
                            Description = "Teaching Faculty",
                            Name = "Teacher"
                        });
                });

            modelBuilder.Entity("EduVerse.API.Models.Semester", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    MySqlPropertyBuilderExtensions.UseMySqlIdentityColumn(b.Property<int>("Id"));

                    b.Property<string>("Code")
                        .IsRequired()
                        .HasMaxLength(20)
                        .HasColumnType("varchar(20)");

                    b.Property<int>("CollegeId")
                        .HasColumnType("int");

                    b.Property<DateTime>("EndDate")
                        .HasColumnType("datetime(6)");

                    b.Property<bool>("IsActive")
                        .HasColumnType("tinyint(1)");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("varchar(100)");

                    b.Property<DateTime>("StartDate")
                        .HasColumnType("datetime(6)");

                    b.HasKey("Id");

                    b.HasIndex("CollegeId", "Code")
                        .IsUnique();

                    b.ToTable("Semesters");
                });

            modelBuilder.Entity("EduVerse.API.Models.Subject", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    MySqlPropertyBuilderExtensions.UseMySqlIdentityColumn(b.Property<int>("Id"));

                    b.Property<int>("ClassesPerWeek")
                        .HasColumnType("int");

                    b.Property<string>("Code")
                        .IsRequired()
                        .HasMaxLength(20)
                        .HasColumnType("varchar(20)");

                    b.Property<int>("CollegeId")
                        .HasColumnType("int");

                    b.Property<int>("Credits")
                        .HasColumnType("int");

                    b.Property<int>("DepartmentId")
                        .HasColumnType("int");

                    b.Property<int>("DurationMinutes")
                        .HasColumnType("int");

                    b.Property<bool>("IsActive")
                        .HasColumnType("tinyint(1)");

                    b.Property<bool>("IsElective")
                        .HasColumnType("tinyint(1)");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("varchar(100)");

                    b.Property<bool>("RequiresLab")
                        .HasColumnType("tinyint(1)");

                    b.Property<int?>("TeacherId")
                        .HasColumnType("int");

                    b.Property<string>("Type")
                        .HasMaxLength(50)
                        .HasColumnType("varchar(50)");

                    b.HasKey("Id");

                    b.HasIndex("CollegeId");

                    b.HasIndex("TeacherId");

                    b.HasIndex("DepartmentId", "Code")
                        .IsUnique();

                    b.ToTable("Subjects");
                });

            modelBuilder.Entity("EduVerse.API.Models.TimeSlot", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    MySqlPropertyBuilderExtensions.UseMySqlIdentityColumn(b.Property<int>("Id"));

                    b.Property<int>("CollegeId")
                        .HasColumnType("int");

                    b.Property<TimeSpan>("EndTime")
                        .HasColumnType("time(6)");

                    b.Property<bool>("IsActive")
                        .HasColumnType("tinyint(1)");

                    b.Property<string>("Shift")
                        .IsRequired()
                        .HasMaxLength(20)
                        .HasColumnType("varchar(20)");

                    b.Property<TimeSpan>("StartTime")
                        .HasColumnType("time(6)");

                    b.HasKey("Id");

                    b.HasIndex("CollegeId", "Shift", "StartTime", "EndTime")
                        .IsUnique();

                    b.ToTable("TimeSlots");
                });

            modelBuilder.Entity("EduVerse.API.Models.Timetable", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    MySqlPropertyBuilderExtensions.UseMySqlIdentityColumn(b.Property<int>("Id"));

                    b.Property<int?>("ApprovedByUserId")
                        .HasColumnType("int");

                    b.Property<DateTime?>("ApprovedDate")
                        .HasColumnType("datetime(6)");

                    b.Property<int>("CollegeId")
                        .HasColumnType("int");

                    b.Property<string>("Comments")
                        .HasMaxLength(500)
                        .HasColumnType("varchar(500)");

                    b.Property<int>("GeneratedByUserId")
                        .HasColumnType("int");

                    b.Property<DateTime>("GeneratedDate")
                        .HasColumnType("datetime(6)");

                    b.Property<bool>("IsActive")
                        .HasColumnType("tinyint(1)");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("varchar(100)");

                    b.Property<double?>("OptimizationScore")
                        .HasColumnType("double");

                    b.Property<int>("SemesterId")
                        .HasColumnType("int");

                    b.Property<string>("Status")
                        .IsRequired()
                        .HasMaxLength(20)
                        .HasColumnType("varchar(20)");

                    b.HasKey("Id");

                    b.HasIndex("ApprovedByUserId");

                    b.HasIndex("CollegeId");

                    b.HasIndex("GeneratedByUserId");

                    b.HasIndex("SemesterId");

                    b.ToTable("Timetables");
                });

            modelBuilder.Entity("EduVerse.API.Models.TimetableEntry", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    MySqlPropertyBuilderExtensions.UseMySqlIdentityColumn(b.Property<int>("Id"));

                    b.Property<int>("ClassroomId")
                        .HasColumnType("int");

                    b.Property<string>("DayOfWeek")
                        .IsRequired()
                        .HasMaxLength(20)
                        .HasColumnType("varchar(20)");

                    b.Property<string>("Notes")
                        .HasMaxLength(100)
                        .HasColumnType("varchar(100)");

                    b.Property<int>("PeriodNumber")
                        .HasColumnType("int");

                    b.Property<int>("SubjectId")
                        .HasColumnType("int");

                    b.Property<int>("TeacherId")
                        .HasColumnType("int");

                    b.Property<int>("TimeSlotId")
                        .HasColumnType("int");

                    b.Property<int>("TimetableId")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.HasIndex("ClassroomId");

                    b.HasIndex("SubjectId");

                    b.HasIndex("TeacherId");

                    b.HasIndex("TimeSlotId");

                    b.HasIndex("TimetableId", "DayOfWeek", "PeriodNumber")
                        .IsUnique();

                    b.ToTable("TimetableEntries");
                });

            modelBuilder.Entity("EduVerse.API.Models.User", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    MySqlPropertyBuilderExtensions.UseMySqlIdentityColumn(b.Property<int>("Id"));

                    b.Property<int>("CollegeId")
                        .HasColumnType("int");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("datetime(6)");

                    b.Property<int?>("DepartmentId")
                        .HasColumnType("int");

                    b.Property<string>("Designation")
                        .HasMaxLength(50)
                        .HasColumnType("varchar(50)");

                    b.Property<string>("Email")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("varchar(100)");

                    b.Property<string>("FullName")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("varchar(100)");

                    b.Property<bool>("IsActive")
                        .HasColumnType("tinyint(1)");

                    b.Property<bool>("IsApproved")
                        .HasColumnType("tinyint(1)");

                    b.Property<bool>("IsEmailVerified")
                        .HasColumnType("tinyint(1)");

                    b.Property<DateTime?>("LastLogin")
                        .HasColumnType("datetime(6)");

                    b.Property<int>("MaxClassesPerDay")
                        .HasColumnType("int");

                    b.Property<int>("MaxClassesPerWeek")
                        .HasColumnType("int");

                    b.Property<string>("OtpCode")
                        .HasColumnType("longtext");

                    b.Property<DateTime?>("OtpExpiry")
                        .HasColumnType("datetime(6)");

                    b.Property<string>("PasswordHash")
                        .IsRequired()
                        .HasColumnType("longtext");

                    b.Property<string>("PasswordResetToken")
                        .HasColumnType("longtext");

                    b.Property<DateTime?>("PasswordResetTokenExpiry")
                        .HasColumnType("datetime(6)");

                    b.Property<int>("RoleId")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.HasIndex("CollegeId");

                    b.HasIndex("DepartmentId");

                    b.HasIndex("RoleId");

                    b.HasIndex("Email", "CollegeId")
                        .IsUnique();

                    b.ToTable("Users");
                });

            modelBuilder.Entity("EduVerse.API.Models.Classroom", b =>
                {
                    b.HasOne("EduVerse.API.Models.College", "College")
                        .WithMany("Classrooms")
                        .HasForeignKey("CollegeId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("College");
                });

            modelBuilder.Entity("EduVerse.API.Models.Constraint", b =>
                {
                    b.HasOne("EduVerse.API.Models.College", "College")
                        .WithMany()
                        .HasForeignKey("CollegeId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("College");
                });

            modelBuilder.Entity("EduVerse.API.Models.Department", b =>
                {
                    b.HasOne("EduVerse.API.Models.College", "College")
                        .WithMany("Departments")
                        .HasForeignKey("CollegeId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("College");
                });

            modelBuilder.Entity("EduVerse.API.Models.FixedClass", b =>
                {
                    b.HasOne("EduVerse.API.Models.Classroom", "Classroom")
                        .WithMany()
                        .HasForeignKey("ClassroomId");

                    b.HasOne("EduVerse.API.Models.Subject", "Subject")
                        .WithMany()
                        .HasForeignKey("SubjectId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("EduVerse.API.Models.User", "Teacher")
                        .WithMany()
                        .HasForeignKey("TeacherId");

                    b.HasOne("EduVerse.API.Models.TimeSlot", "TimeSlot")
                        .WithMany("FixedClasses")
                        .HasForeignKey("TimeSlotId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Classroom");

                    b.Navigation("Subject");

                    b.Navigation("Teacher");

                    b.Navigation("TimeSlot");
                });

            modelBuilder.Entity("EduVerse.API.Models.Semester", b =>
                {
                    b.HasOne("EduVerse.API.Models.College", "College")
                        .WithMany("Semesters")
                        .HasForeignKey("CollegeId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("College");
                });

            modelBuilder.Entity("EduVerse.API.Models.Subject", b =>
                {
                    b.HasOne("EduVerse.API.Models.College", "College")
                        .WithMany("Subjects")
                        .HasForeignKey("CollegeId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("EduVerse.API.Models.Department", "Department")
                        .WithMany("Subjects")
                        .HasForeignKey("DepartmentId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("EduVerse.API.Models.User", "Teacher")
                        .WithMany()
                        .HasForeignKey("TeacherId")
                        .OnDelete(DeleteBehavior.Restrict);

                    b.Navigation("College");

                    b.Navigation("Department");

                    b.Navigation("Teacher");
                });

            modelBuilder.Entity("EduVerse.API.Models.TimeSlot", b =>
                {
                    b.HasOne("EduVerse.API.Models.College", "College")
                        .WithMany("TimeSlots")
                        .HasForeignKey("CollegeId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("College");
                });

            modelBuilder.Entity("EduVerse.API.Models.Timetable", b =>
                {
                    b.HasOne("EduVerse.API.Models.User", "ApprovedBy")
                        .WithMany("ApprovedTimetables")
                        .HasForeignKey("ApprovedByUserId")
                        .OnDelete(DeleteBehavior.Restrict);

                    b.HasOne("EduVerse.API.Models.College", "College")
                        .WithMany("Timetables")
                        .HasForeignKey("CollegeId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("EduVerse.API.Models.User", "GeneratedBy")
                        .WithMany("GeneratedTimetables")
                        .HasForeignKey("GeneratedByUserId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.HasOne("EduVerse.API.Models.Semester", "Semester")
                        .WithMany("Timetables")
                        .HasForeignKey("SemesterId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("ApprovedBy");

                    b.Navigation("College");

                    b.Navigation("GeneratedBy");

                    b.Navigation("Semester");
                });

            modelBuilder.Entity("EduVerse.API.Models.TimetableEntry", b =>
                {
                    b.HasOne("EduVerse.API.Models.Classroom", "Classroom")
                        .WithMany("TimetableEntries")
                        .HasForeignKey("ClassroomId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("EduVerse.API.Models.Subject", "Subject")
                        .WithMany("TimetableEntries")
                        .HasForeignKey("SubjectId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("EduVerse.API.Models.User", "Teacher")
                        .WithMany("TimetableEntries")
                        .HasForeignKey("TeacherId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.HasOne("EduVerse.API.Models.TimeSlot", "TimeSlot")
                        .WithMany("TimetableEntries")
                        .HasForeignKey("TimeSlotId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("EduVerse.API.Models.Timetable", "Timetable")
                        .WithMany("Entries")
                        .HasForeignKey("TimetableId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Classroom");

                    b.Navigation("Subject");

                    b.Navigation("Teacher");

                    b.Navigation("TimeSlot");

                    b.Navigation("Timetable");
                });

            modelBuilder.Entity("EduVerse.API.Models.User", b =>
                {
                    b.HasOne("EduVerse.API.Models.College", "College")
                        .WithMany("Users")
                        .HasForeignKey("CollegeId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("EduVerse.API.Models.Department", "Department")
                        .WithMany("Users")
                        .HasForeignKey("DepartmentId");

                    b.HasOne("EduVerse.API.Models.Role", "Role")
                        .WithMany("Users")
                        .HasForeignKey("RoleId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("College");

                    b.Navigation("Department");

                    b.Navigation("Role");
                });

            modelBuilder.Entity("EduVerse.API.Models.Classroom", b =>
                {
                    b.Navigation("TimetableEntries");
                });

            modelBuilder.Entity("EduVerse.API.Models.College", b =>
                {
                    b.Navigation("Classrooms");

                    b.Navigation("Departments");

                    b.Navigation("Semesters");

                    b.Navigation("Subjects");

                    b.Navigation("TimeSlots");

                    b.Navigation("Timetables");

                    b.Navigation("Users");
                });

            modelBuilder.Entity("EduVerse.API.Models.Department", b =>
                {
                    b.Navigation("Subjects");

                    b.Navigation("Users");
                });

            modelBuilder.Entity("EduVerse.API.Models.Role", b =>
                {
                    b.Navigation("Users");
                });

            modelBuilder.Entity("EduVerse.API.Models.Semester", b =>
                {
                    b.Navigation("Timetables");
                });

            modelBuilder.Entity("EduVerse.API.Models.Subject", b =>
                {
                    b.Navigation("TimetableEntries");
                });

            modelBuilder.Entity("EduVerse.API.Models.TimeSlot", b =>
                {
                    b.Navigation("FixedClasses");

                    b.Navigation("TimetableEntries");
                });

            modelBuilder.Entity("EduVerse.API.Models.Timetable", b =>
                {
                    b.Navigation("Entries");
                });

            modelBuilder.Entity("EduVerse.API.Models.User", b =>
                {
                    b.Navigation("ApprovedTimetables");

                    b.Navigation("GeneratedTimetables");

                    b.Navigation("TimetableEntries");
                });
#pragma warning restore 612, 618
        }
    }
}

