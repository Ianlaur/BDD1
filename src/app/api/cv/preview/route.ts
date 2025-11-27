import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "User ID required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      studentProfile: {
        include: {
          projects: {
            orderBy: { startDate: "desc" },
          },
          experiences: {
            orderBy: { startDate: "desc" },
          },
        },
      },
      memberships: {
        include: {
          association: {
            include: {
              user: true,
            },
          },
        },
        where: { status: "ACTIVE" },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Generate HTML CV preview
  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>CV - ${user.name}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          line-height: 1.6;
          color: #1f2937;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 2rem;
        }
        
        .container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          border-radius: 16px;
          overflow: hidden;
        }
        
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 3rem 2rem;
          text-align: center;
        }
        
        .header h1 {
          font-size: 2.5rem;
          font-weight: 900;
          margin-bottom: 0.5rem;
          letter-spacing: -0.025em;
        }
        
        .header .email {
          font-size: 1.1rem;
          opacity: 0.9;
          margin-bottom: 1rem;
        }
        
        .badges {
          display: flex;
          gap: 0.75rem;
          justify-content: center;
          flex-wrap: wrap;
          margin-top: 1rem;
        }
        
        .badge {
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          padding: 0.5rem 1rem;
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 600;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
        
        .content {
          padding: 2rem;
        }
        
        .section {
          margin-bottom: 2rem;
          padding-bottom: 2rem;
          border-bottom: 2px dashed #e5e7eb;
        }
        
        .section:last-child {
          border-bottom: none;
        }
        
        .section-title {
          font-size: 1.5rem;
          font-weight: 800;
          color: #667eea;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .bio {
          color: #4b5563;
          font-size: 1rem;
          line-height: 1.8;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }
        
        .info-item {
          background: #f3f4f6;
          padding: 1rem;
          border-radius: 12px;
          border: 2px solid #e5e7eb;
        }
        
        .info-label {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          color: #6b7280;
          letter-spacing: 0.05em;
          margin-bottom: 0.25rem;
        }
        
        .info-value {
          font-size: 1rem;
          font-weight: 600;
          color: #1f2937;
        }
        
        .association-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .association-item {
          background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
          padding: 1.5rem;
          border-radius: 12px;
          border-left: 4px solid #667eea;
        }
        
        .association-name {
          font-size: 1.125rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 0.25rem;
        }
        
        .association-role {
          font-size: 0.875rem;
          color: #6b7280;
          text-transform: capitalize;
        }
        
        .interests-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        
        .interest-tag {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 600;
        }
        
        .links {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }
        
        .link-button {
          background: #667eea;
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 9999px;
          text-decoration: none;
          font-weight: 600;
          font-size: 0.875rem;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          transition: transform 0.2s;
        }
        
        .link-button:hover {
          transform: translateY(-2px);
        }
        
        .footer {
          background: #f9fafb;
          padding: 1.5rem 2rem;
          text-align: center;
          color: #6b7280;
          font-size: 0.875rem;
        }
        
        @media print {
          body {
            background: white;
            padding: 0;
          }
          
          .container {
            box-shadow: none;
            border-radius: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${user.name || "Nom non renseigné"}</h1>
          <div class="email">${user.email}</div>
          <div class="badges">
            ${user.studentProfile?.profileStatus ? `<span class="badge">${user.studentProfile.profileStatus === "STUDENT" ? "🎓 Étudiant" : "👨‍🏫 Professeur"}</span>` : ""}
            ${user.studentProfile?.school ? `<span class="badge">🏫 ${user.studentProfile.school === "ALBERT" ? "Albert School" : "Eugenia"}</span>` : ""}
            ${user.studentProfile?.major ? `<span class="badge">📚 ${user.studentProfile.major}</span>` : ""}
            ${user.studentProfile?.graduationYear ? `<span class="badge">🎯 Promo ${user.studentProfile.graduationYear}</span>` : ""}
          </div>
        </div>
        
        <div class="content">
          ${
            user.studentProfile?.bio
              ? `
          <div class="section">
            <h2 class="section-title">
              <span>👤</span>
              <span>À propos</span>
            </h2>
            <p class="bio">${user.studentProfile.bio}</p>
          </div>
          `
              : ""
          }
          
          ${
            user.studentProfile?.program || user.studentProfile?.programYear
              ? `
          <div class="section">
            <h2 class="section-title">
              <span>🎓</span>
              <span>Formation</span>
            </h2>
            <div class="info-grid">
              ${user.studentProfile?.program ? `
              <div class="info-item">
                <div class="info-label">Programme</div>
                <div class="info-value">${user.studentProfile.program}</div>
              </div>
              ` : ""}
              ${user.studentProfile?.programYear ? `
              <div class="info-item">
                <div class="info-label">Année</div>
                <div class="info-value">Année ${user.studentProfile.programYear}</div>
              </div>
              ` : ""}
            </div>
          </div>
          `
              : ""
          }
          
          ${
            user.studentProfile?.experiences && user.studentProfile.experiences.length > 0
              ? `
          <div class="section">
            <h2 class="section-title">
              <span>💼</span>
              <span>Expériences professionnelles</span>
            </h2>
            <div class="association-list">
              ${user.studentProfile.experiences
                .map(
                  (exp) => `
                <div class="association-item">
                  <div class="association-name">${exp.position} - ${exp.company}</div>
                  <div class="association-role">
                    ${exp.location || ""} • 
                    ${new Date(exp.startDate).toLocaleDateString("fr-FR", { year: "numeric", month: "long" })} - 
                    ${exp.current ? "Aujourd'hui" : exp.endDate ? new Date(exp.endDate).toLocaleDateString("fr-FR", { year: "numeric", month: "long" }) : ""}
                  </div>
                  ${exp.description ? `<p style="margin-top: 0.5rem; color: #4b5563;">${exp.description}</p>` : ""}
                </div>
              `
                )
                .join("")}
            </div>
          </div>
          `
              : ""
          }
          
          ${
            user.studentProfile?.projects && user.studentProfile.projects.length > 0
              ? `
          <div class="section">
            <h2 class="section-title">
              <span>🚀</span>
              <span>Projets personnels</span>
            </h2>
            <div class="association-list">
              ${user.studentProfile.projects
                .map(
                  (project) => `
                <div class="association-item">
                  <div class="association-name">${project.title}</div>
                  <div class="association-role">
                    ${project.startDate ? new Date(project.startDate).toLocaleDateString("fr-FR", { year: "numeric", month: "long" }) : ""} 
                    ${project.ongoing ? " - En cours" : project.endDate ? ` - ${new Date(project.endDate).toLocaleDateString("fr-FR", { year: "numeric", month: "long" })}` : ""}
                  </div>
                  ${project.description ? `<p style="margin-top: 0.5rem; color: #4b5563;">${project.description}</p>` : ""}
                  ${project.technologies.length > 0 ? `
                    <div style="margin-top: 0.5rem; display: flex; flex-wrap: wrap; gap: 0.5rem;">
                      ${project.technologies.map((tech) => `<span style="background: #dbeafe; color: #1e40af; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600;">${tech}</span>`).join("")}
                    </div>
                  ` : ""}
                  ${project.url || project.githubUrl ? `
                    <div style="margin-top: 0.5rem;">
                      ${project.url ? `<a href="${project.url}" style="color: #667eea; margin-right: 1rem;">🔗 Voir le projet</a>` : ""}
                      ${project.githubUrl ? `<a href="${project.githubUrl}" style="color: #667eea;">🐙 GitHub</a>` : ""}
                    </div>
                  ` : ""}
                </div>
              `
                )
                .join("")}
            </div>
          </div>
          `
              : ""
          }
          
          ${
            user.memberships && user.memberships.length > 0
              ? `
          <div class="section">
            <h2 class="section-title">
              <span>🏢</span>
              <span>Expérience associative</span>
            </h2>
            <div class="association-list">
              ${user.memberships
                .map(
                  (membership) => `
                <div class="association-item">
                  <div class="association-name">${membership.association.user.name}</div>
                  <div class="association-role">${membership.role || "Membre"}</div>
                </div>
              `
                )
                .join("")}
            </div>
          </div>
          `
              : ""
          }
          
          ${
            user.studentProfile?.interests && user.studentProfile.interests.length > 0
              ? `
          <div class="section">
            <h2 class="section-title">
              <span>💡</span>
              <span>Centres d'intérêt</span>
            </h2>
            <div class="interests-list">
              ${user.studentProfile.interests.map((interest) => `<span class="interest-tag">${interest}</span>`).join("")}
            </div>
          </div>
          `
              : ""
          }
          
          ${
            user.studentProfile?.linkedinUrl || user.studentProfile?.githubUrl
              ? `
          <div class="section">
            <h2 class="section-title">
              <span>🔗</span>
              <span>Liens</span>
            </h2>
            <div class="links">
              ${user.studentProfile?.linkedinUrl ? `<a href="${user.studentProfile.linkedinUrl}" class="link-button" target="_blank">🔗 LinkedIn</a>` : ""}
              ${user.studentProfile?.githubUrl ? `<a href="${user.studentProfile.githubUrl}" class="link-button" target="_blank">🐙 GitHub</a>` : ""}
            </div>
          </div>
          `
              : ""
          }
        </div>
        
        <div class="footer">
          Généré automatiquement depuis Association Connect • ${new Date().toLocaleDateString("fr-FR")}
        </div>
      </div>
    </body>
    </html>
  `;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
