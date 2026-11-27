# Full-Stack To-Do List

A fast, persistent, and accessible task manager powered by an **ASP.NET Core 9 REST API**, **Entity Framework Core**, and **PostgreSQL**, paired with a modular vanilla JavaScript front end featuring keyed DOM reconciliation, optimistic UI updates, and an `esbuild` asset pipeline.

## Live Demo

- **Live Site (Netlify):** [https://evancru-todo-list.netlify.app](https://evancru-todo-list.netlify.app)
- **Live REST API (Render):** [https://todo-7jq1.onrender.com/api/tasks](https://todo-7jq1.onrender.com/api/tasks)
- **Cold-Start Note:** The back-end API is hosted on Render's free tier, which spins down after 15 minutes of inactivity. If the app has been idle, the initial request may take **30–50 seconds** to wake the container before tasks load; subsequent requests respond immediately.

## Architecture & Tech Stack

- **Back-End:** ASP.NET Core 9 Web API, Entity Framework Core, PostgreSQL (`Npgsql`)
- **Front-End:** Modular ES6 JavaScript, Keyed DOM reconciliation (`Map`), Optimistic UI updates with rollback, WCAG AA accessibility, `esbuild` bundling
- **Testing & CI:** xUnit integration tests with SQLite in-memory provider + GitHub Actions CI

## Features

- **Full-Stack REST API & PostgreSQL Persistence:** Built with C# / ASP.NET Core 9 and Entity Framework Core (`Npgsql`), supporting full CRUD (`GET`, `POST`, `PATCH`, `DELETE`), transactional task reordering (`PATCH /api/tasks/reorder`), and bulk deletion.
- **Optimistic UI & Keyed DOM Reconciliation:** Updates the UI instantaneously on user actions with automatic rollback on network errors, diffing existing task nodes by unique `data-id` keys via a `Map` without full list re-renders.
- **Instant Filtering & Bulk Actions:** Filter views by **All**, **Active**, or **Completed**, edit task text inline (`Enter` to save, `Escape` to cancel), and run one-click **Clear Completed** or **Clear All** (with confirmation).
- **Automated Integration Tests & CI:** Verified by an xUnit test suite (`TodoApi.Tests` using SQLite in-memory relational testing) and automated via GitHub Actions CI on every push and pull request.
- **Accessible & Responsive:** WCAG AA color contrast, high-visibility `:focus-visible` keyboard outlines, descriptive `aria-label` attributes, and mobile-first responsive layouts (100/100 Lighthouse scores).

## Project Structure

```text
todo/
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI (esbuild + dotnet test)
├── index.html                  # Semantic HTML5 markup
├── styles/
│   ├── variables.css           # CSS custom properties (--bg, --card, --accent, --muted)
│   ├── base.css                # Reset, centered layout, card container, and focus rings
│   ├── tasks.css               # Task rows, inline edit input, action & reorder buttons
│   ├── filters.css             # Filter tabs, bulk actions, and responsive breakpoints
│   └── main.css                # CSS entry point (@import partials)
├── scripts/
│   ├── storage.js              # Async REST API client (fetch) with error handling
│   ├── render.js               # Keyed DOM reconciliation and task element rendering
│   └── main.js                 # JS entry point (optimistic state updates and event delegation)
├── server/
│   ├── Dockerfile              # Multi-stage .NET 9 container build for Render
│   ├── TodoSolution.sln        # .NET 9 solution file
│   ├── TodoApi/
│   │   ├── Controllers/        # TasksController (REST endpoints & atomic reorder)
│   │   ├── Data/               # AppDbContext & EF Core PostgreSQL migrations
│   │   ├── DTOs/               # Request & response records
│   │   ├── Models/             # TodoItem entity model
│   │   ├── Program.cs          # DI, Npgsql, OpenAPI, auto-migrations, and CORS configuration
│   │   └── TodoApi.http        # Executable REST Client API test requests
│   └── TodoApi.Tests/
│       └── TasksControllerTests.cs # xUnit integration tests
├── package.json                # Front-end build scripts and devDependencies
└── README.md
```

## Getting Started

### Prerequisites

- **Node.js** (v20+)
- **.NET 9 SDK** (`9.0.x`)
- **PostgreSQL** (running locally on port `5432`)

### 1. Clone the Repository

```bash
git clone https://github.com/cuduco19/todo.git
cd todo
```

### 2. Run the Back-End API & Tests

1. Configure your PostgreSQL connection string in `server/TodoApi/appsettings.Development.json`:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Host=localhost;Port=5432;Database=tododb;Username=postgres;Password=postgres"
     }
   }
   ```

2. Apply EF Core migrations and start the API:
   ```bash
   cd server/TodoApi
   dotnet ef database update
   dotnet run
   ```

3. Run the xUnit integration test suite:
   ```bash
   cd ../TodoApi.Tests
   dotnet test --verbosity normal
   ```

### 3. Build & Preview the Front-End

1. From the repository root, install dependencies and bundle production assets:
   ```bash
   npm install
   npm run build
   ```

2. Open `index.html` using a local development server (such as VS Code Live Server).

## Deployment

- **Front-End (Netlify):** Static site automatically built via `npm run build` (`esbuild`) and deployed from `.` (root) on every push to `main`.
- **Back-End API (Render):** Containerized `.NET 9` Web API (`https://todo-7jq1.onrender.com`) built via `server/Dockerfile` and hosted on Render's free tier (`512 MB` RAM, `0.1` CPU; spins down after 15 minutes of inactivity and wakes automatically on incoming HTTP requests).
- **Database (Neon):** Serverless **PostgreSQL** instance with automatic EF Core schema migrations executed on container startup (`db.Database.Migrate()`).

## Author

**EvanCru** — [cuduco_19@hotmail.com](mailto:cuduco_19@hotmail.com)