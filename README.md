<div align="center">

<img src="./src/public/assets/logo.svg" alt="LOFT Logo" width="200" height="200" style="margin: 20px 0;" />

# LOFT

<a href="https://eugeniaschool.com" target="_blank">
  <img src="./src/public/assets/schools/logoeugenia.png" alt="Eugenia School Logo" width="150" style="margin: 15px 0;" />
</a>

<br/><br/>

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15.5.6-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![License](https://img.shields.io/badge/license-MIT-green.svg)

**LOFT - A modern web platform connecting students with campus organizations**

[Documentation](./docs/en/) • [Documentation FR](./docs/fr/) • [Report Bug](https://github.com/Ianlaur/BDD1/issues) • [Request Feature](https://github.com/Ianlaur/BDD1/issues)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Documentation](#-documentation)
- [Management](#-management)
- [Development](#-development)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

Association Connect Platform is a comprehensive digital solution designed to bridge the gap between students and campus organizations. The platform provides a centralized hub where students can discover and join associations, while giving association administrators powerful tools to manage their communities, events, and communications.

### Key Highlights

- 🎨 **Modern UI/UX** - LinkedIn-style interface with vibrant gradients and dark mode support
- 🔐 **Secure Authentication** - Email/password and Google OAuth integration
- 📱 **Fully Responsive** - Mobile-first design that works beautifully on all devices
- ⚡ **High Performance** - Built with Next.js 15 and optimized for speed
- 🎭 **Role-Based Access** - Granular permissions for students, associations, and admins

---

## ✨ Features

### For Students
- 🔍 **Discover Associations** - Browse and search through campus organizations
- 👥 **Join Communities** - Request membership with one-click
- 📅 **Event Registration** - Register for events and manage attendance
- 📬 **Notifications** - Stay updated on events, memberships, and announcements
- 👤 **Personal Profile** - Showcase interests, major, and involvement

### For Associations
- 📊 **Management Dashboard** - Comprehensive overview with key metrics
- ✅ **Membership Management** - Approve/reject requests, manage member roles
- 🎉 **Event Creation** - Create, publish, and manage events with capacity limits
- 📝 **Content Publishing** - Share updates and announcements with followers
- 🎨 **Custom Branding** - Personalized profile with logo, description, and links

### For Administrators
- 🛡️ **User Management** - View, edit, and moderate user accounts
- ✓ **Association Verification** - Verify legitimate campus organizations
- 📈 **Platform Analytics** - Monitor system health and user activity
- 🔧 **Content Moderation** - Review and moderate platform content

---

## 🛠 Tech Stack

### Frontend
- **[Next.js 15.5.6](https://nextjs.org/)** - React framework with App Router
- **[React 19](https://react.dev/)** - UI library
- **[TypeScript 5.x](https://www.typescriptlang.org/)** - Type safety
- **[TailwindCSS 4.0](https://tailwindcss.com/)** - Utility-first CSS framework

### Backend
- **[Node.js 18+](https://nodejs.org/)** - JavaScript runtime
- **[Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)** - Serverless API endpoints
- **[Prisma 6.19.0](https://www.prisma.io/)** - Database ORM
- **[NextAuth.js v5](https://next-auth.js.org/)** - Authentication

### Database & Hosting
- **[Neon PostgreSQL](https://neon.tech/)** - Serverless PostgreSQL database
- **[Vercel](https://vercel.com/)** - Edge network deployment platform

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **PostgreSQL** database (Neon recommended)
- **Google OAuth** credentials (optional, for OAuth login)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Ianlaur/BDD1.git
   cd BDD1
   ```

2. **Install dependencies**
   ```bash
   cd src
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the `src` directory:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@host:5432/database"
   DIRECT_URL="postgresql://user:password@host:5432/database"

   # NextAuth
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"

   # Google OAuth (Optional)
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   ```

4. **Initialize the database**
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed  # Optional: seed with sample data
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
BDD1/
├── docs/                          # Documentation
│   ├── en/                        # English documentation
│   │   ├── PRD.md                # Product Requirements Document
│   │   └── functionalSpecification.md
│   └── fr/                        # French documentation
│       ├── PRD.md
│       └── specificationFonctionnelle.md
├── src/                           # Source code
│   ├── app/                       # Next.js App Router
│   │   ├── api/                  # API routes
│   │   ├── auth/                 # Authentication pages
│   │   ├── associations/         # Association pages
│   │   ├── events/               # Event pages
│   │   ├── profile/              # Profile pages
│   │   └── admin/                # Admin pages
│   ├── components/               # React components
│   ├── lib/                      # Utility libraries
│   │   ├── auth.ts              # NextAuth configuration
│   │   └── prisma.ts            # Prisma client
│   ├── prisma/                   # Database schema and migrations
│   │   ├── schema.prisma        # Prisma schema
│   │   ├── seed.ts              # Database seeding
│   │   └── migrations/          # Migration history
│   ├── public/                   # Static assets
│   ├── scripts/                  # Utility scripts
│   └── types/                    # TypeScript type definitions
├── .gitignore
├── LICENSE
└── README.md
```

---

## 📚 Documentation

Comprehensive documentation is available in both English and French:

### English 🇬🇧
- **[Product Requirements Document (PRD)](./docs/en/PRD.md)** - Complete product specifications, features, and requirements
- **[Functional Specification](./docs/en/functionalSpecification.md)** - Detailed functional behaviors, user flows, and validation rules

### Français 🇫🇷
- **[Document d'Exigences Produit (PRD)](./docs/fr/PRD.md)** - Spécifications complètes du produit
- **[Spécification Fonctionnelle](./docs/fr/specificationFonctionnelle.md)** - Comportements fonctionnels détaillés

---

## 🧑‍💼 Management

Toute la coordination interne se fait sur notre espace Notion. Rejoignez-le pour accéder aux plans d'actions, roadmaps et comptes rendus : [Espace de travail Notion](https://outrageous-devourer-1da.notion.site/ebd/2b760265710780ffbcf7f99faed58045?v=2b76026571078082ab37000c071f0948).


---

## 💻 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npx prisma studio    # Open Prisma Studio (database GUI)
npx prisma generate  # Generate Prisma Client
npx prisma db push   # Push schema changes to database
npx prisma db seed   # Seed database with sample data
npx prisma migrate dev --name description  # Create a new migration
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `DIRECT_URL` | Direct database connection (for migrations) | Yes |
| `NEXTAUTH_SECRET` | Secret for NextAuth.js session encryption | Yes |
| `NEXTAUTH_URL` | Application URL | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | No |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | No |

### Code Style

This project uses:
- **ESLint** for code linting
- **TypeScript** for type checking
- **Prettier** (recommended) for code formatting

---

## 🌐 Deployment

### Deploy to Vercel

1. **Push your code to GitHub**

2. **Import to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

3. **Configure Environment Variables**
   - Add all required environment variables in Vercel dashboard
   - Update `NEXTAUTH_URL` to your production URL

4. **Deploy**
   - Vercel will automatically build and deploy your application
   - Every push to your main branch triggers a new deployment

### Database Setup

1. **Create a Neon PostgreSQL database**
   - Visit [neon.tech](https://neon.tech)
   - Create a new project
   - Copy the connection string

2. **Update environment variables**
   - Set `DATABASE_URL` and `DIRECT_URL` in Vercel

3. **Run migrations**
   ```bash
   npx prisma migrate deploy
   ```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Development Guidelines

- Write clear, descriptive commit messages
- Follow the existing code style and conventions
- Add tests for new features when applicable
- Update documentation for significant changes
- Ensure all tests pass before submitting PR

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Next.js Team** - For the amazing React framework
- **Vercel** - For hosting and edge network infrastructure
- **Prisma** - For the excellent database ORM
- **Neon** - For serverless PostgreSQL database

---

## 📞 Contact & Support

- **Documentation**: [English](./docs/en/) | [Français](./docs/fr/)
- **Issues**: [GitHub Issues](https://github.com/Ianlaur/BDD1/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Ianlaur/BDD1/discussions)

---

<div align="center">

**[⬆ Back to Top](#association-connect-platform)**

Made with ❤️ by students at Eugenia School

</div>
