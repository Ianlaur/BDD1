# Association Connect Platform

A modern web platform built with Next.js that connects students with campus clubs and associations.

## 🚀 Features

- **User Authentication**: Email/password and Google OAuth sign-in
- **Association Discovery**: Browse and search student organizations
- **Event Management**: Create, manage, and attend campus events
- **Membership System**: Join associations and manage memberships
- **Communication Tools**: Messaging and notifications
- **News Feed**: Stay updated with association posts and announcements

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS 4
- **Database**: Neon PostgreSQL (Production) / PostgreSQL (Local)
- **ORM**: Prisma
- **Authentication**: NextAuth.js v5
- **Hosting**: Vercel

## 📋 Prerequisites

- Node.js 18+ and npm
- A Neon PostgreSQL database account
- (Optional) Google OAuth credentials for social login

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd src
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

   Update the `.env` file with your credentials:
   ```env
   # Database (Neon PostgreSQL)
   DATABASE_URL="postgresql://user:password@ep-xxxxx.region.aws.neon.tech/dbname?sslmode=require"

   # NextAuth
   NEXTAUTH_SECRET="your-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"

   # Google OAuth (Optional)
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   ```

   **To generate NEXTAUTH_SECRET**:
   ```bash
   openssl rand -base64 32
   ```

4. **Set up the database**

   Push the Prisma schema to your database:
   ```bash
   npm run db:push
   ```

   Or run migrations:
   ```bash
   npm run db:migrate
   ```

5. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
npm run build
npm start
```

## 📊 Database Management

- **View database in Prisma Studio**:
  ```bash
  npm run db:studio
  ```

- **Push schema changes**:
  ```bash
  npm run db:push
  ```

- **Create a migration**:
  ```bash
  npm run db:migrate
  ```

## 🗄️ Database Schema

The application uses the following main models:

- `User` - User accounts (students and associations)
- `StudentProfile` - Extended profile for students
- `AssociationProfile` - Extended profile for associations
- `Event` - Campus events
- `Membership` - Association memberships
- `Post` - News feed posts
- `Message` - Direct messaging
- `Notification` - System notifications

## 🌐 Deployment

### Deploy to Render

1. **Create a new Web Service** on [Render](https://render.com)

2. **Connect your repository**

3. **Configure the service**:
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npm start`
   - **Environment**: Node

4. **Add environment variables** in Render dashboard:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (your Render app URL)
   - `GOOGLE_CLIENT_ID` (optional)
   - `GOOGLE_CLIENT_SECRET` (optional)

5. **Deploy!**

### Setting up Neon Database

1. Go to [Neon Console](https://console.neon.tech)
2. Create a new project
3. Copy the connection string
4. Add it to your environment variables as `DATABASE_URL`

## 📁 Project Structure

```
src/
├── app/                # Next.js App Router pages
│   ├── api/           # API routes
│   ├── auth/          # Authentication pages
│   ├── layout.tsx     # Root layout
│   └── page.tsx       # Home page
├── components/        # React components
│   ├── Header.tsx
│   └── Footer.tsx
├── lib/              # Utility functions
│   ├── auth.ts       # NextAuth configuration
│   └── prisma.ts     # Prisma client
├── prisma/           # Database schema
│   └── schema.prisma
├── types/            # TypeScript types
│   └── next-auth.d.ts
└── public/           # Static assets
```

## 🔐 Authentication

The platform supports two authentication methods:

1. **Email/Password**: Traditional authentication with hashed passwords
2. **Google OAuth**: Social login via Google

## 🎨 Customization

### Styling

The project uses TailwindCSS. Modify `app/globals.css` for global styles or use Tailwind classes directly in components.

### Database Schema

To modify the database schema:

1. Edit `prisma/schema.prisma`
2. Run `npm run db:migrate` to create a migration
3. The Prisma Client will be regenerated automatically

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Create and run migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed the database with test data

## 🚀 Deployment

### Deploy to Vercel

This project is configured for Vercel deployment. See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

**Quick Start:**

1. Push your code to the `main` branch on GitHub
2. Import the project on [Vercel](https://vercel.com/new)
3. Set **Root Directory** to `src`
4. Add environment variables (see `.env.production.example`)
5. Deploy!

**Important**: Only the `main` branch will trigger deployments (configured in `vercel.json`).

### Environment Variables for Production

Copy `.env.production.example` and set these in Vercel:

- `DATABASE_URL` - Your Neon PostgreSQL connection string
- `NEXTAUTH_SECRET` - Your NextAuth secret key
- `NEXTAUTH_URL` - Your Vercel deployment URL
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` (optional)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
- Check the [documentation](https://nextjs.org/docs)
- Review [Prisma docs](https://www.prisma.io/docs)
- Open an issue in the repository

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Prisma for the excellent ORM
- NextAuth.js for authentication
- Neon for serverless PostgreSQL
