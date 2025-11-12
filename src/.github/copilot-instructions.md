# Association Connect Platform - Copilot Instructions

## Project Overview
An Association Connect Platform built with Next.js 14, connecting students with clubs and associations.

## Tech Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Database**: Neon PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js (email/password + Google OAuth)
- **Hosting**: Render

## Development Guidelines
- Use TypeScript for all files
- Follow Next.js App Router conventions
- Use server components by default, client components when needed
- Keep components modular and reusable
- Use Prisma for all database operations
- Implement proper error handling and loading states
- Follow responsive design principles with mobile-first approach

## Project Structure
- `/app` - Next.js App Router pages and API routes
- `/components` - Reusable React components
- `/lib` - Utility functions and shared logic
- `/prisma` - Database schema and migrations
- `/public` - Static assets

## Key Features (from PRD)
- User authentication and profiles (students & associations)
- Association discovery and search
- Event management and calendar
- Membership management
- Communication tools (messaging, notifications)
- News feed and updates

## Best Practices
- Use server actions for mutations
- Implement proper authentication checks
- Validate all user inputs
- Use environment variables for sensitive data
- Write clean, documented code
- Follow accessibility standards
