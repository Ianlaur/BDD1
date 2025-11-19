# 🔐 Test Credentials - Association Connect Platform

## Quick Login Reference

### 🔧 Platform Admin (Full Access)
```
Email: admin@associationconnect.com
Password: dev@2025
Role: ADMIN
```
**Access:** Admin dashboard, user management, association verification

---

### 🏢 Ian Laurent Association (Primary Test Account)
```
Email: ilaurent@eugeniaschool.com
Password: admin123
Role: ASSOCIATION
Status: ✅ Verified
```
**Access:** ERP System (Team, Budget, Projects, Calendar), Events, Posts, Member Management

**ERP Features:**
- Team Management: Add/edit team members, roles, departments
- Budget Management: Track income/expenses, financial reports
- Project Boards: Kanban-style task management
- Calendar: Schedule meetings, view events

---

### 👨‍🎓 Student Accounts

#### John Doe (CS Student)
```
Email: john.doe@university.edu
Password: password123
Major: Computer Science (2025)
Interests: AI, Web Development, Robotics, Gaming
```

#### Jane Smith (Business Student)
```
Email: jane.smith@university.edu
Password: password123
Major: Business Administration (2024)
Interests: Entrepreneurship, Finance, Marketing, Leadership
```

#### Alex Johnson (Engineering Student)
```
Email: alex.johnson@university.edu
Password: password123
Major: Mechanical Engineering (2026)
Interests: Robotics, 3D Printing, Sustainability, Innovation
```

---

### 🎯 Other Test Associations

#### 1. Tech Innovation Club
```
Email: contact@techclub.university.edu
Password: password123
Category: Technology
Status: ✅ Verified
```

#### 2. Entrepreneurship Society
```
Email: info@entrepreneurship.university.edu
Password: password123
Category: Business
Status: ✅ Verified
```

#### 3. Robotics Engineering Club
```
Email: hello@robotics.university.edu
Password: password123
Category: Engineering
Status: ✅ Verified
```

#### 4. Campus Photography Club
```
Email: snap@photography.university.edu
Password: password123
Category: Arts & Culture
Status: ❌ Not Verified
```

#### 5. University Debate Society
```
Email: speak@debate.university.edu
Password: password123
Category: Academic
Status: ✅ Verified
```

---

## 🧪 Testing Workflows

### Test Platform Admin Features
1. Login as: `admin@associationconnect.com` / `dev@2025`
2. Navigate to `/admin`
3. Test user management and association verification

### Test ERP System (Best with Ian Laurent Account)
1. Login as: `ilaurent@eugeniaschool.com` / `admin123`
2. Go to your association dashboard
3. Click "ERP System" in Quick Actions
4. Test all 4 modules:
   - **Team**: Add members, assign roles, manage departments
   - **Budget**: Add income/expenses, view category breakdowns
   - **Projects**: Create projects, add tasks, move through Kanban
   - **Calendar**: Schedule meetings, view events, add notes

### Test Student Experience
1. Login as any student (password: `password123`)
2. Browse associations at `/associations`
3. Join new associations
4. Register for events
5. Edit profile and interests

### Test Association Management
1. Login as any association (password: `password123`)
2. Access management dashboard at `/associations/[id]/manage`
3. Test:
   - Edit profile
   - Create events
   - Create posts
   - Approve member requests
   - Access settings

---

## 📊 Database Commands

```bash
# Reset database and recreate all test accounts
npm run db:seed

# Run migrations
npx prisma migrate dev

# Open Prisma Studio (visual database editor)
npx prisma studio

# Generate Prisma Client
npx prisma generate
```

---

## 🚀 Getting Started

1. **Start Development Server:**
   ```bash
   npm run dev
   ```

2. **Access Application:**
   - Local: http://localhost:3000
   - Sign in with any account above

3. **Best Test Path:**
   - Login as Ian Laurent (`ilaurent@eugeniaschool.com` / `admin123`)
   - Navigate to ERP System
   - Test all modules with full admin access

---

## ✨ Key Features to Test

### For Associations:
- ✅ Profile management
- ✅ Event creation and management
- ✅ Post/announcement creation
- ✅ Member approval workflow
- ✅ **ERP System** (Team, Budget, Projects, Calendar)

### For Students:
- ✅ Profile customization
- ✅ Association discovery and search
- ✅ Event registration
- ✅ Membership requests
- ✅ Dashboard with personalized content

### For Admins:
- ✅ User management
- ✅ Association verification
- ✅ System monitoring
- ✅ Content moderation

---

**Last Updated:** November 19, 2025
**Database:** Seeded with comprehensive test data
**All Features:** Production-ready and fully functional
