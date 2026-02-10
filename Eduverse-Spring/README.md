# 🎓 EduVerse - Advanced Multi-Tenant Class Scheduling System

EduVerse is a state-of-the-art, multi-tenant academic resource management and automated scheduling platform. It empowers educational institutions to manage departments, faculty, and classrooms while leveraging a sophisticated **Genetic Algorithm with Backtracking** to generate optimized, conflict-free timetables.

Built with a robust **ASP.NET Core 8 / Spring Boot 3** backend architecture and a stunning **React 18** frontend, EduVerse delivers a premium user experience with modern aesthetics and high performance.

---

## ✨ Key Features

- **🌐 Multi-Tenancy Architecture**: Isolated data environments for multiple colleges within a single platform.
- **🛡️ Advanced RBAC**: Four distinct roles—**Super Admin**, **College Admin**, **HOD**, and **Teacher**.
- **🧬 AI-Powered Scheduling**: Intelligent Genetic Algorithm optimized with backtracking for complex constraint resolution.
- **📧 Secure Authentication**: JWT-based auth with email verification, OTP, and secure password reset workflows.
- **📊 Real-time Analytics**: Dynamic dashboards for Super Admins and College Admins to monitor institution health.
- **🎨 Premium UI/UX**: Modern Glassmorphism design system using Tailwind CSS, featuring smooth transitions and responsive layouts.
- **✅ Approval Workflow**: Dedicated review system for HODs to approve or request changes to generated schedules.
- **📱 Fully Responsive**: Seamless experience across desktops, tablets, and mobile devices.

---

## 🛠️ Technology Stack

### Backend Options
| Component | .NET Implementation | Spring Boot Implementation |
| :--- | :--- | :--- |
| **Framework** | ASP.NET Core 8.0 Web API | Spring Boot 3.4.x |
| **Language** | C# 12 | Java 17 |
| **ORM** | Entity Framework Core | Spring Data JPA |
| **Database** | MySQL 8.0 | MySQL 8.0 |
| **Auth** | JWT / BCrypt | JWT / Spring Security |
| **Docs** | Swagger / OpenAPI | SpringDoc OpenAPI |

### Frontend
- **Library**: React 18 (Vite)
- **Styling**: Tailwind CSS & Glassmorphism
- **State Management**: React Context API
- **Routing**: React Router v6
- **Data Fetching**: Axios
- **Visuals**: Heroicons, Recharts, Framer Motion

---

## 📁 Project Structure

```
EduVerse/
├── EduVerse.API/          # Primary .NET 8 Backend
│   ├── Controllers/       # REST Endpoints
│   ├── Services/          # Genetic Algorithm & Logic
│   ├── Models/            # EF Core Entities
│   └── Data/              # Database Context & Migrations
│
├── eduverse-spring/       # Optional Spring Boot Backend
│   ├── src/main/java/     # Core logic and API
│   └── pom.xml            # Maven Configuration
│
├── frontend/              # Unified React Frontend
│   ├── src/pages/         # Feature-rich UI pages
│   ├── src/components/    # Reusable modern components
│   └── src/services/      # API Integration layers
│
└── SETUP.md               # Detailed installation guide
```

---

## 📊 Database Architecture

The system utilizes a complex relational schema consisting of several core entities:

1.  **Colleges**: Root entity for multi-tenancy.
2.  **Users**: Federated user identities with role-specific permissions.
3.  **Roles**: Super Admin, Admin, HOD, Teacher.
4.  **Departments**: Academic groupings within a college.
5.  **Classrooms**: Physical assets with capacity and location.
6.  **Subjects**: Curricular items with credit and workload meta.
7.  **Semesters**: Time-bound academic terms.
8.  **TimeSlots**: Atomic units of scheduling.
9.  **Timetables**: Generated solution sets.
10. **TimetableEntries**: Specific scheduled sessions.
11. **FixedClasses**: Hard-coded scheduling requirements.
12. **Constraints**: Dynamic rules for GA optimization.
13. **EmailVerifications**: OTP and verification state management.

---

## 🚀 Quick Setup

1.  **Database**: Create a MySQL schema named `eduverse`.
2.  **Backend**: Configure `appsettings.json` (for .NET) or `application.properties` (for Spring Boot).
3.  **Run Service**: Use `dotnet run` or `./mvnw spring-boot:run`.
4.  **Frontend**: Run `npm install && npm run dev`.

*For detailed instructions, see **[SETUP.md](./SETUP.md)**.*

---

## 🔐 Default Access

For initial setup, the **Super Admin** can be registered via the registration portal or directly through the API.

- **Super Admin**: Manages overall system and approves new College registrations.
- **College Admin**: Manages their specific institution's data and staff.
- **HOD**: Manages department-specific scheduling and approvals.
- **Teacher**: Views their personalized schedule.

---

**Built with ❤️ by the EduVerse Team**
