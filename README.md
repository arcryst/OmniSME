# OmniSME - Canadian SME Business Platform

## Tech Stack
- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express + TypeScript
- Database: PostgreSQL + Prisma
- Styling: Tailwind CSS
- Hosting: OVHcloud

## Development Setup
1. Install dependencies: `npm install`
2. Start PostgreSQL: `brew services start postgresql@15`
3. Run database migrations: `npx prisma migrate dev`
4. Start backend: `cd api && npm run dev`
5. Start frontend: `npm run dev`

## Current Status
- [x] Project initialization
- [ ] Authentication system
- [ ] Dashboard foundation