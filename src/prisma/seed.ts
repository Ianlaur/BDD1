import { PrismaClient, UserRole, MembershipStatus, EventStatus } from "@prisma/client";
import { hash } from "bcryptjs";
import { config } from "dotenv";

// Load environment variables
config();

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Clear existing data
  console.log("Clearing existing data...");
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.eventRegistration.deleteMany();
  await prisma.event.deleteMany();
  await prisma.post.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.associationProfile.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  // Create password hash
  const hashedPassword = await hash("password123", 12);

  // Create Students
  console.log("Creating student users...");
  const student1 = await prisma.user.create({
    data: {
      email: "john.doe@university.edu",
      name: "John Doe",
      password: hashedPassword,
      role: UserRole.STUDENT,
      emailVerified: new Date(),
      studentProfile: {
        create: {
          bio: "Computer Science major passionate about AI and machine learning.",
          major: "Computer Science",
          graduationYear: 2025,
          interests: ["AI", "Web Development", "Robotics", "Gaming"],
        },
      },
    },
  });

  const student2 = await prisma.user.create({
    data: {
      email: "jane.smith@university.edu",
      name: "Jane Smith",
      password: hashedPassword,
      role: UserRole.STUDENT,
      emailVerified: new Date(),
      studentProfile: {
        create: {
          bio: "Business student interested in entrepreneurship and startups.",
          major: "Business Administration",
          graduationYear: 2024,
          interests: ["Entrepreneurship", "Finance", "Marketing", "Leadership"],
        },
      },
    },
  });

  const student3 = await prisma.user.create({
    data: {
      email: "alex.johnson@university.edu",
      name: "Alex Johnson",
      password: hashedPassword,
      role: UserRole.STUDENT,
      emailVerified: new Date(),
      studentProfile: {
        create: {
          bio: "Engineering student who loves to build things and solve problems.",
          major: "Mechanical Engineering",
          graduationYear: 2026,
          interests: ["Robotics", "3D Printing", "Sustainability", "Innovation"],
        },
      },
    },
  });

  // Create Associations
  console.log("Creating association users...");
  const techClub = await prisma.user.create({
    data: {
      email: "contact@techclub.university.edu",
      name: "Tech Innovation Club",
      password: hashedPassword,
      role: UserRole.ASSOCIATION,
      emailVerified: new Date(),
      image: "https://api.dicebear.com/7.x/initials/svg?seed=TIC",
      associationProfile: {
        create: {
          description:
            "We are a community of tech enthusiasts exploring cutting-edge technologies, organizing hackathons, and building innovative projects together.",
          category: "Technology",
          website: "https://techclub.university.edu",
          contactEmail: "contact@techclub.university.edu",
          socialLinks: [
            "https://twitter.com/techclub",
            "https://github.com/techclub",
            "https://discord.gg/techclub",
          ],
          verified: true,
        },
      },
    },
    include: {
      associationProfile: true,
    },
  });

  const businessClub = await prisma.user.create({
    data: {
      email: "info@entrepreneurship.university.edu",
      name: "Entrepreneurship Society",
      password: hashedPassword,
      role: UserRole.ASSOCIATION,
      emailVerified: new Date(),
      image: "https://api.dicebear.com/7.x/initials/svg?seed=ES",
      associationProfile: {
        create: {
          description:
            "Connect with aspiring entrepreneurs, learn from successful founders, and turn your startup ideas into reality. We host pitch competitions, workshops, and networking events.",
          category: "Business",
          website: "https://entrepreneurship.university.edu",
          contactEmail: "info@entrepreneurship.university.edu",
          contactPhone: "+1 (555) 123-4567",
          socialLinks: [
            "https://linkedin.com/company/entrepreneurship-society",
            "https://instagram.com/entrepreneurship_society",
          ],
          verified: true,
        },
      },
    },
    include: {
      associationProfile: true,
    },
  });

  const roboticsClub = await prisma.user.create({
    data: {
      email: "hello@robotics.university.edu",
      name: "Robotics Engineering Club",
      password: hashedPassword,
      role: UserRole.ASSOCIATION,
      emailVerified: new Date(),
      image: "https://api.dicebear.com/7.x/initials/svg?seed=REC",
      associationProfile: {
        create: {
          description:
            "Design, build, and program robots! From beginners to advanced, we welcome all students interested in robotics, automation, and mechatronics.",
          category: "Engineering",
          website: "https://robotics.university.edu",
          contactEmail: "hello@robotics.university.edu",
          socialLinks: [
            "https://youtube.com/@roboticsclub",
            "https://twitter.com/roboticsclub",
          ],
          verified: true,
        },
      },
    },
    include: {
      associationProfile: true,
    },
  });

  const photographyClub = await prisma.user.create({
    data: {
      email: "snap@photography.university.edu",
      name: "Campus Photography Club",
      password: hashedPassword,
      role: UserRole.ASSOCIATION,
      emailVerified: new Date(),
      image: "https://api.dicebear.com/7.x/initials/svg?seed=CPC",
      associationProfile: {
        create: {
          description:
            "Capture moments, tell stories, and develop your photography skills. Weekly photo walks, portfolio reviews, and exhibitions.",
          category: "Arts & Culture",
          website: "https://photography.university.edu",
          contactEmail: "snap@photography.university.edu",
          socialLinks: [
            "https://instagram.com/campus_photography",
            "https://flickr.com/groups/campusphoto",
          ],
          verified: false,
        },
      },
    },
    include: {
      associationProfile: true,
    },
  });

  const debateClub = await prisma.user.create({
    data: {
      email: "speak@debate.university.edu",
      name: "University Debate Society",
      password: hashedPassword,
      role: UserRole.ASSOCIATION,
      emailVerified: new Date(),
      image: "https://api.dicebear.com/7.x/initials/svg?seed=UDS",
      associationProfile: {
        create: {
          description:
            "Sharpen your critical thinking and public speaking skills. Participate in debates, tournaments, and workshops on current affairs and philosophy.",
          category: "Academic",
          contactEmail: "speak@debate.university.edu",
          socialLinks: ["https://facebook.com/universitydebatesociety"],
          verified: true,
        },
      },
    },
    include: {
      associationProfile: true,
    },
  });

  // Create Memberships
  console.log("Creating memberships...");
  await prisma.membership.createMany({
    data: [
      {
        userId: student1.id,
        associationId: techClub.associationProfile!.id,
        status: MembershipStatus.ACTIVE,
        role: "member",
      },
      {
        userId: student1.id,
        associationId: roboticsClub.associationProfile!.id,
        status: MembershipStatus.ACTIVE,
        role: "member",
      },
      {
        userId: student2.id,
        associationId: businessClub.associationProfile!.id,
        status: MembershipStatus.ACTIVE,
        role: "president",
      },
      {
        userId: student2.id,
        associationId: photographyClub.associationProfile!.id,
        status: MembershipStatus.ACTIVE,
        role: "member",
      },
      {
        userId: student3.id,
        associationId: roboticsClub.associationProfile!.id,
        status: MembershipStatus.ACTIVE,
        role: "vice-president",
      },
      {
        userId: student3.id,
        associationId: techClub.associationProfile!.id,
        status: MembershipStatus.PENDING,
        role: "member",
      },
    ],
  });

  // Create Events
  console.log("Creating events...");
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const hackathon = await prisma.event.create({
    data: {
      title: "Annual Hackathon 2025",
      description:
        "24-hour hackathon where teams compete to build innovative solutions. Prizes, food, and mentorship included!",
      location: "Engineering Building, Room 101",
      startDate: nextWeek,
      endDate: new Date(nextWeek.getTime() + 24 * 60 * 60 * 1000),
      capacity: 100,
      status: EventStatus.PUBLISHED,
      associationId: techClub.associationProfile!.id,
    },
  });

  await prisma.event.create({
    data: {
      title: "Startup Pitch Competition",
      description:
        "Present your startup idea to a panel of investors and entrepreneurs. Winner receives $5,000 in seed funding!",
      location: "Business School Auditorium",
      startDate: new Date(nextMonth.getTime() + 5 * 24 * 60 * 60 * 1000),
      endDate: new Date(nextMonth.getTime() + 5 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
      capacity: 200,
      status: EventStatus.PUBLISHED,
      associationId: businessClub.associationProfile!.id,
    },
  });

  await prisma.event.create({
    data: {
      title: "Robot Building Workshop",
      description:
        "Learn the basics of robotics and build your first robot. All materials provided. Beginners welcome!",
      location: "Robotics Lab, Building C",
      startDate: new Date(nextWeek.getTime() + 3 * 24 * 60 * 60 * 1000),
      endDate: new Date(nextWeek.getTime() + 3 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
      capacity: 30,
      status: EventStatus.PUBLISHED,
      associationId: roboticsClub.associationProfile!.id,
    },
  });

  await prisma.event.create({
    data: {
      title: "Golden Hour Photography Walk",
      description:
        "Join us for a scenic campus walk during golden hour. Share tips, techniques, and capture beautiful moments.",
      location: "Meet at Main Campus Fountain",
      startDate: new Date(nextWeek.getTime() + 2 * 24 * 60 * 60 * 1000),
      endDate: new Date(nextWeek.getTime() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      capacity: 20,
      status: EventStatus.PUBLISHED,
      associationId: photographyClub.associationProfile!.id,
    },
  });

  // Create Event Registrations
  console.log("Creating event registrations...");
  await prisma.eventRegistration.createMany({
    data: [
      {
        userId: student1.id,
        eventId: hackathon.id,
        status: "registered",
      },
      {
        userId: student3.id,
        eventId: hackathon.id,
        status: "registered",
      },
    ],
  });

  // Create Posts
  console.log("Creating posts...");
  await prisma.post.createMany({
    data: [
      {
        title: "Welcome New Members! 🎉",
        content:
          "We're excited to welcome all new members to the Tech Innovation Club! Our first meeting is next Tuesday. Come meet the team and learn about our upcoming projects.",
        published: true,
        associationId: techClub.associationProfile!.id,
      },
      {
        title: "Hackathon Registration Now Open!",
        content:
          "The wait is over! Registration for our Annual Hackathon 2025 is now open. Limited spots available - register now to secure your spot!",
        published: true,
        associationId: techClub.associationProfile!.id,
      },
      {
        title: "Meet Our Sponsors",
        content:
          "We're thrilled to announce our amazing sponsors for this year's pitch competition. Thank you to TechVentures, StartupFund, and InnovateCapital for supporting student entrepreneurs!",
        published: true,
        associationId: businessClub.associationProfile!.id,
      },
      {
        title: "Workshop Materials Ready",
        content:
          "All materials for the Robot Building Workshop are ready! We have Arduino kits, sensors, motors, and everything you need to build your first robot. Can't wait to see what you create!",
        published: true,
        associationId: roboticsClub.associationProfile!.id,
      },
    ],
  });

  // Create some notifications
  console.log("Creating notifications...");
  await prisma.notification.createMany({
    data: [
      {
        userId: student1.id,
        title: "Event Registration Confirmed",
        content: "You're registered for Annual Hackathon 2025!",
        type: "event",
        read: false,
      },
      {
        userId: student2.id,
        title: "New Member Request",
        content: "You have a new membership request to review.",
        type: "membership",
        read: false,
      },
      {
        userId: student3.id,
        title: "Upcoming Event Reminder",
        content: "Robot Building Workshop starts in 3 days!",
        type: "reminder",
        read: false,
      },
    ],
  });

  console.log("✅ Database seeded successfully!");
  console.log("\n📊 Created:");
  console.log("  - 3 Students");
  console.log("  - 5 Associations");
  console.log("  - 6 Memberships");
  console.log("  - 4 Events");
  console.log("  - 2 Event Registrations");
  console.log("  - 4 Posts");
  console.log("  - 3 Notifications");
  console.log("\n🔐 Test Credentials:");
  console.log("  Email: john.doe@university.edu");
  console.log("  Email: jane.smith@university.edu");
  console.log("  Email: alex.johnson@university.edu");
  console.log("  Email: contact@techclub.university.edu");
  console.log("  Password: password123");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
