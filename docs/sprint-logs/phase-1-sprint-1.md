# Phase 1 Foundation - 20 Hour Sprint Tasks

## Pre-Development Setup (Hours 1-3)

### Task 1: Environment Setup (2 hours)
**Objective:** Get development environment ready for macOS
- [ ] Install Homebrew: `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`
- [ ] Install Node.js via Homebrew: `brew install node` (gets you latest stable)
- [ ] Verify installation: `node --version && npm --version`
- [ ] Install VS Code with extensions:
  - ES7+ React snippets
  - Prettier
  - ESLint
  - Thunder Client (API testing)
  - PostgreSQL extension
- [ ] Install PostgreSQL: `brew install postgresql@15`
- [ ] Start PostgreSQL service: `brew services start postgresql@15`
- [ ] Install Git (likely already installed): `git --version`
- [ ] Setup GitHub repository and clone locally
- [ ] Create OVHcloud account and explore hosting options
- [ ] Optional but recommended: Install iTerm2 for better terminal experience

### Task 2: Project Architecture Planning (1 hour)
**Objective:** Document the technical foundation
- [ ] Create project folder structure:
```
sme-platform/
├── README.md
├── .gitignore
├── package.json
├── .env.example
├── .env.local
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   └── index.ts
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Layout.tsx
│   │   └── forms/
│   │       ├── LoginForm.tsx
│   │       └── RegisterForm.tsx
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login.tsx
│   │   │   └── Register.tsx
│   │   ├── dashboard/
│   │   │   └── Dashboard.tsx
│   │   └── Home.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   └── useApi.ts
│   ├── utils/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   └── validation.ts
│   ├── types/
│   │   ├── auth.ts
│   │   └── api.ts
│   ├── styles/
│   │   └── globals.css
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── api/
│   ├── package.json
│   ├── .env
│   ├── tsconfig.json
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   └── index.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   ├── cors.ts
│   │   │   └── error.ts
│   │   ├── utils/
│   │   │   ├── jwt.ts
│   │   │   ├── password.ts
│   │   │   └── validation.ts
│   │   ├── types/
│   │   │   └── auth.ts
│   │   └── server.ts
│   └── dist/
└── docs/
    ├── setup.md
    └── api.md
```
- [ ] Initialize Git repository with .gitignore
- [ ] Document technology stack decisions in README.md
- [ ] Set up basic project management (GitHub Issues or Trello)

## Core Application Bootstrap (Hours 4-12)

### Task 3: Frontend Foundation (4 hours)
**Objective:** Create the React application shell
- [ ] Initialize React app with Vite: `npm create vite@latest sme-platform -- --template react-ts`
- [ ] Install core dependencies:
  ```bash
  npm install @tanstack/react-router @tanstack/react-query
  npm install tailwindcss @tailwindcss/forms @tailwindcss/typography
  npm install lucide-react react-hook-form @hookform/resolvers zod
  ```
- [ ] Configure Tailwind CSS
- [ ] Create basic folder structure:
  ```
  /src
    /components
      /ui (button, input, card components)
      /layout (header, sidebar, footer)
    /pages
      /auth (login, register)
      /dashboard
    /hooks
    /utils
    /types
  ```
- [ ] Build basic layout components (Header, Sidebar, Main content area)
- [ ] Create a simple routing structure with placeholder pages

### Task 4: Backend Foundation (4 hours)
**Objective:** Set up Node.js API server
- [ ] Create `/api` folder in project root
- [ ] Initialize Node.js project: `npm init -y`
- [ ] Install backend dependencies:
  ```bash
  npm install express cors helmet morgan dotenv
  npm install @types/express @types/cors @types/node tsx nodemon --save-dev
  npm install prisma @prisma/client bcryptjs jsonwebtoken
  ```
- [ ] Create basic Express server with:
  - CORS configuration for development
  - Basic middleware (helmet, morgan, cors)
  - Health check endpoint (`/api/health`)
  - Basic error handling middleware
- [ ] Set up development scripts in package.json
- [ ] Test server startup and health endpoint

## Database Setup (Hours 13-16)

### Task 5: Database Schema Design (2 hours)
**Objective:** Create foundational database structure
- [ ] Initialize Prisma: `npx prisma init`
- [ ] Configure database URL in `.env` file:
  ```
  DATABASE_URL="postgresql://username:password@localhost:5432/sme_platform_dev"
  ```
  (Default macOS PostgreSQL usually has your username with no password)
- [ ] Create database: `createdb sme_platform_dev` (run this in terminal)
- [ ] Design initial schema in `schema.prisma`:
  ```prisma
  generator client {
    provider = "prisma-client-js"
  }

  datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL")
  }

  // Core entities for multi-tenant architecture
  model Organization {
    id        String   @id @default(cuid())
    name      String
    domain    String?  @unique
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt
    users     User[]
  }

  model User {
    id             String       @id @default(cuid())
    email          String       @unique
    passwordHash   String
    firstName      String
    lastName       String
    role           UserRole     @default(USER)
    organizationId String
    organization   Organization @relation(fields: [organizationId], references: [id])
    createdAt      DateTime     @default(now())
    updatedAt      DateTime     @updatedAt
  }

  enum UserRole {
    ADMIN
    USER
    VIEWER
  }
  ```
- [ ] Run first migration: `npx prisma migrate dev --name init`
- [ ] Generate Prisma client: `npx prisma generate`

### Task 6: Authentication Setup (2 hours)
**Objective:** Basic user authentication system
- [ ] Create authentication utilities:
  - Password hashing functions
  - JWT token generation/validation
  - Middleware for protected routes
- [ ] Build auth endpoints:
  - POST `/api/auth/register`
  - POST `/api/auth/login`
  - GET `/api/auth/me` (protected)
- [ ] Test authentication flow with basic curl commands or Thunder Client

## Frontend-Backend Integration (Hours 17-20)

### Task 7: Authentication UI (2 hours)
**Objective:** Build login/register forms
- [ ] Create login form component with React Hook Form
- [ ] Create registration form component
- [ ] Add form validation with Zod schemas
- [ ] Style forms with Tailwind (keep it simple)
- [ ] Add loading states and error handling

### Task 8: API Integration (2 hours)
**Objective:** Connect frontend to backend
- [ ] Set up React Query for API calls
- [ ] Create API client utilities in `/src/utils/api.ts`
- [ ] Implement authentication context/hook
- [ ] Test full registration and login flow
- [ ] Add protected route wrapper component
- [ ] Create basic dashboard page (can be empty for now)

## Documentation & Next Steps

### Task 9: Documentation (30 minutes)
- [ ] Update README.md with:
  - Setup instructions
  - How to run development servers
  - Current features implemented
  - Next development priorities
- [ ] Document any issues encountered and solutions

### Task 10: Planning Session (30 minutes)
- [ ] Review completed tasks
- [ ] Identify any blockers or technical debt
- [ ] Plan next 20-hour sprint priorities
- [ ] Update project board/issues

## Key Learning Resources

**If you get stuck, these are your best friends:**
- **React + TypeScript:** React TypeScript Cheatsheet (github.com/typescript-cheatsheets/react)
- **Tailwind CSS:** Official docs (tailwindcss.com)
- **Prisma:** Getting started guide (prisma.io/docs)
- **Express + TypeScript:** Express with TypeScript setup guides
- **Authentication:** JWT authentication tutorials

## Success Criteria for Sprint 1

By the end of 20 hours, you should have:
- ✅ A React app running on `localhost:3000`
- ✅ A Node.js API running on `localhost:3001`
- ✅ PostgreSQL database with basic schema
- ✅ Working user registration and login
- ✅ Protected dashboard route
- ✅ Clean, documented codebase ready for next features

## Pro Tips for Solo Development

1. **Don't perfect everything** - Get it working first, refactor later
2. **Use TypeScript strictly** - It'll save you debugging time later
3. **Test each component as you build** - Don't wait until the end
4. **Commit frequently** - Every working feature should be a commit
5. **When stuck, simplify** - Remove complexity until it works, then add back

## Emergency Contacts
- **Stack Overflow** for specific coding issues
- **GitHub Issues** on related open source projects
- **Discord/Reddit** communities for React, Node.js
- **Official documentation** should be your first stop

## MacBook-Specific Development Notes

### Running Development Servers
**Frontend (Terminal 1):**
```bash
cd sme-platform
npm run dev
# Runs on http://localhost:5173 (Vite default)
```

**Backend (Terminal 2):**
```bash
cd sme-platform/api
npm run dev
# Runs on http://localhost:3001
```

### Database Management on macOS
- **Start PostgreSQL:** `brew services start postgresql@15`
- **Stop PostgreSQL:** `brew services stop postgresql@15`
- **Access PostgreSQL CLI:** `psql postgres`
- **View databases:** `\l` (in psql)
- **Connect to your database:** `\c sme_platform_dev`

### Helpful macOS Commands
- **Open project in VS Code:** `code .` (from project directory)
- **Check running processes:** `lsof -i :3001` (check if port is in use)
- **Kill process on port:** `kill -9 $(lsof -t -i:3001)`

### macOS Gotchas to Avoid
- **Port conflicts:** macOS sometimes reserves ports. If 3001 is taken, use 3002
- **Permission issues:** Avoid using `sudo` with npm. If you get permission errors, fix npm permissions
- **Case sensitivity:** macOS is case-insensitive but git is case-sensitive. Be consistent with file naming