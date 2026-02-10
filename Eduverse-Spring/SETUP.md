# ⚙️ Setup & Installation Guide

Follow these steps to get **EduVerse** up and running on your local machine.

---

## 📋 Prerequisites

Ensure you have the following installed:
- **MySQL 8.0+**
- **Node.js (v18+)** & **npm**
- **.NET 8 SDK** (for .NET Backend)
- **Java 17+** & **Maven** (for Spring Boot Backend)

---

## 🗄️ 1. Database Setup

1.  Login to your MySQL instance.
2.  Create the database:
    ```sql
    CREATE DATABASE eduverse;
    ```

---

## 💻 2. Backend Setup (Choose One)

### Option A: .NET 8 Backend (Primary)
1.  Navigate to the API folder:
    ```bash
    cd EduVerse.API
    ```
2.  Update `appsettings.json` with your MySQL credentials:
    ```json
    "ConnectionStrings": {
      "DefaultConnection": "Server=localhost;Database=eduverse;User=root;Password=YOUR_PASSWORD;"
    }
    ```
3.  *(Optional)* Configure SMTP for Email Verifications:
    ```json
    "EmailSettings": {
      "SmtpServer": "smtp.gmail.com",
      "SmtpPort": 587,
      "SenderEmail": "your-email@gmail.com",
      "SenderPassword": "your-app-password"
    }
    ```
4.  Apply Migrations & Run:
    ```bash
    dotnet ef database update
    dotnet run
    ```
    - **API**: `http://localhost:5000`
    - **Swagger**: `http://localhost:5000/swagger`

### Option B: Spring Boot Backend
1.  Navigate to the Spring folder:
    ```bash
    cd eduverse-spring
    ```
2.  Update `src/main/resources/application.properties`:
    ```properties
    spring.datasource.url=jdbc:mysql://localhost:3306/eduverse
    spring.datasource.username=root
    spring.datasource.password=YOUR_PASSWORD
    ```
3.  Run the application:
    ```bash
    ./mvnw spring-boot:run
    ```
    - **API**: `http://localhost:8080`
    - **Swagger**: `http://localhost:8080/swagger-ui/index.html`

*Note: The frontend is configured by default to connect to the .NET backend (Port 5000). To switch, update `frontend/src/config/apiConfig.js`.*

---

## 🎨 3. Frontend Setup

1.  Navigate to the frontend folder:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
    - **URL**: `http://localhost:5173`

---

## 🛡️ 4. Initial Account Creation

Since EduVerse is multi-tenant, you need a **Super Admin** to manage the system.

1.  **Register a Super Admin**:
    - Open the frontend or visit Swagger.
    - Use the `/api/auth/register` endpoint.
    - Set `RoleId` to `1` (Super Admin).
    - *Note: In a production environment, the first Super Admin is usually seeded or created via a secure script.*

2.  **Approve Colleges**:
    - Login as Super Admin.
    - New colleges registering via the landing page will appear in your "Pending Approvals" dashboard.
    - Once approved, College Admins can log in and start setting up their departments.

---

## 🔧 Troubleshooting

- **CORS Errors**: Ensure the frontend origin (`http://localhost:5173`) is whitelisted in `Program.cs` (.NET) or `WebConfig.java` (Spring).
- **Database Connection**: Verify MySQL is running and the user has `ALL PRIVILEGES` on the `eduverse` schema.
- **Port Conflicts**: If port 5000 or 5173 is in use, you can change them in `Properties/launchSettings.json` (.NET) or `vite.config.js` (Frontend).

---

**Happy Scheduling! 🚀**
