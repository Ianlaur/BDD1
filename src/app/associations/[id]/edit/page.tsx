import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditAssociationPage({ params }: PageProps) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const association = await prisma.associationProfile.findUnique({
    where: { id },
    include: {
      user: true,
    },
  });

  if (!association) {
    notFound();
  }

  // Check if user is admin of this association
  if (session.user.id !== association.userId) {
    redirect(`/associations/${id}`);
  }

  async function updateAssociation(formData: FormData) {
    "use server";
    
    const session = await auth();
    if (!session?.user) {
      redirect("/auth/signin");
    }

    const assoc = await prisma.associationProfile.findUnique({
      where: { id },
    });

    if (!assoc || session.user.id !== assoc.userId) {
      redirect(`/associations/${id}`);
    }

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const website = formData.get("website") as string;
    const contactEmail = formData.get("contactEmail") as string;
    const contactPhone = formData.get("contactPhone") as string;
    const socialLinks = formData.get("socialLinks") as string;
    const logoUrl = formData.get("logoUrl") as string;
    const bannerImageUrl = formData.get("bannerImageUrl") as string;

    // Parse social links
    const socialLinksArray = socialLinks
      .split("\n")
      .map((link) => link.trim())
      .filter((link) => link.length > 0);

    await prisma.$transaction([
      // Update user name and logo
      prisma.user.update({
        where: { id: assoc.userId },
        data: { 
          name,
          image: logoUrl || undefined,
        },
      }),
      // Update association profile
      prisma.associationProfile.update({
        where: { id },
        data: {
          description,
          category,
          website: website || null,
          contactEmail: contactEmail || null,
          contactPhone: contactPhone || null,
          socialLinks: socialLinksArray,
          bannerImage: bannerImageUrl || null,
        },
      }),
    ]);

    redirect(`/associations/${id}/manage`);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-black text-[#112a60] dark:text-white font-heading mb-2">
              ✏️ Edit Association Profile
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Update your association information and branding
            </p>
          </div>

          {/* Form */}
          <form action={updateAssociation} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6">
            {/* Logo URL */}
            <div>
              <label htmlFor="logoUrl" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Logo URL
              </label>
              <input
                type="url"
                id="logoUrl"
                name="logoUrl"
                defaultValue={association.user.image || ""}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#f67a19] focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition"
                placeholder="https://example.com/logo.png"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Recommended: Square image (e.g., 400x400px) for best results
              </p>
              {association.user.image && (
                <div className="mt-3">
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Current Logo:</p>
                  <img 
                    src={association.user.image} 
                    alt="Current logo" 
                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                  />
                </div>
              )}
            </div>

            {/* Banner Image URL */}
            <div>
              <label htmlFor="bannerImageUrl" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Banner Image URL
              </label>
              <input
                type="url"
                id="bannerImageUrl"
                name="bannerImageUrl"
                defaultValue={association.bannerImage || ""}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#f67a19] focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition"
                placeholder="https://example.com/banner.jpg"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Recommended: Landscape image (e.g., 1920x400px) for best results
              </p>
              {association.bannerImage && (
                <div className="mt-3">
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Current Banner:</p>
                  <img 
                    src={association.bannerImage} 
                    alt="Current banner" 
                    className="w-full h-32 rounded-xl object-cover border-2 border-gray-200 dark:border-gray-700"
                  />
                </div>
              )}
            </div>

            {/* Association Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Association Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                defaultValue={association.user.name || ""}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#f67a19] focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition"
                placeholder="Tech Club Association"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                defaultValue={association.description || ""}
                required
                rows={6}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition resize-none"
                placeholder="Tell students about your association, mission, and activities..."
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Category *
              </label>
              <select
                id="category"
                name="category"
                defaultValue={association.category || ""}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition"
              >
                <option value="">Select a category</option>
                <option value="Academic & Professional">Academic & Professional</option>
                <option value="Arts & Culture">Arts & Culture</option>
                <option value="Athletics & Recreation">Athletics & Recreation</option>
                <option value="Community Service">Community Service & Volunteering</option>
                <option value="Cultural & International">Cultural & International</option>
                <option value="Greek Life">Greek Life</option>
                <option value="Media & Publications">Media & Publications</option>
                <option value="Political & Advocacy">Political & Advocacy</option>
                <option value="Religious & Spiritual">Religious & Spiritual</option>
                <option value="Special Interest">Special Interest & Hobbies</option>
                <option value="Technology & Innovation">Technology & Innovation</option>
              </select>
            </div>

            {/* Contact Information */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="contactEmail" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Contact Email
                </label>
                <input
                  type="email"
                  id="contactEmail"
                  name="contactEmail"
                  defaultValue={association.contactEmail || ""}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition"
                  placeholder="contact@association.com"
                />
              </div>

              <div>
                <label htmlFor="contactPhone" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  id="contactPhone"
                  name="contactPhone"
                  defaultValue={association.contactPhone || ""}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            {/* Website */}
            <div>
              <label htmlFor="website" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Website
              </label>
              <input
                type="url"
                id="website"
                name="website"
                defaultValue={association.website || ""}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition"
                placeholder="https://www.yourwebsite.com"
              />
            </div>

            {/* Social Links */}
            <div>
              <label htmlFor="socialLinks" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Social Media Links
              </label>
              <textarea
                id="socialLinks"
                name="socialLinks"
                defaultValue={association.socialLinks?.join("\n") || ""}
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition resize-none"
                placeholder="Enter one URL per line:&#10;https://instagram.com/yourassociation&#10;https://twitter.com/yourassociation&#10;https://linkedin.com/company/yourassociation"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Enter one social media URL per line
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-[#f67a19] hover:bg-[#e56910] text-white font-bold rounded-xl hover:shadow-lg transition"
              >
                💾 Save Changes
              </button>
              <a
                href={`/associations/${id}/manage`}
                className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition text-center"
              >
                Cancel
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
