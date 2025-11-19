import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

async function addTeamMember(formData: FormData) {
  "use server";

  const session = await auth();
  if (!session?.user) return;

  const associationId = formData.get("associationId") as string;
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const position = formData.get("position") as string;
  const role = formData.get("role") as string;
  const department = formData.get("department") as string;
  const notes = formData.get("notes") as string;

  const association = await prisma.associationProfile.findUnique({
    where: { id: associationId },
  });

  if (association?.userId !== session.user.id) {
    return;
  }

  await prisma.teamMember.create({
    data: {
      associationId,
      name,
      email: email || null,
      phone: phone || null,
      position,
      role,
      department: department || null,
      notes: notes || null,
    },
  });

  revalidatePath(`/associations/${associationId}/erp/team`);
}

async function updateTeamMember(formData: FormData) {
  "use server";

  const session = await auth();
  if (!session?.user) return;

  const memberId = formData.get("memberId") as string;
  const associationId = formData.get("associationId") as string;
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const position = formData.get("position") as string;
  const role = formData.get("role") as string;
  const department = formData.get("department") as string;
  const notes = formData.get("notes") as string;
  const active = formData.get("active") === "true";

  const association = await prisma.associationProfile.findUnique({
    where: { id: associationId },
  });

  if (association?.userId !== session.user.id) {
    return;
  }

  await prisma.teamMember.update({
    where: { id: memberId },
    data: {
      name,
      email: email || null,
      phone: phone || null,
      position,
      role,
      department: department || null,
      notes: notes || null,
      active,
    },
  });

  revalidatePath(`/associations/${associationId}/erp/team`);
}

async function deleteTeamMember(formData: FormData) {
  "use server";

  const session = await auth();
  if (!session?.user) return;

  const memberId = formData.get("memberId") as string;
  const associationId = formData.get("associationId") as string;

  const association = await prisma.associationProfile.findUnique({
    where: { id: associationId },
  });

  if (association?.userId !== session.user.id) {
    return;
  }

  await prisma.teamMember.delete({
    where: { id: memberId },
  });

  revalidatePath(`/associations/${associationId}/erp/team`);
}

export default async function TeamManagement({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const association = await prisma.associationProfile.findUnique({
    where: { id },
    include: {
      user: true,
      teamMembers: {
        orderBy: [{ active: "desc" }, { joinedAt: "desc" }],
      },
    },
  });

  if (!association) {
    redirect("/associations");
  }

  if (association.userId !== session.user.id) {
    redirect(`/associations/${id}`);
  }

  const activeMembers = association.teamMembers.filter((m) => m.active);
  const inactiveMembers = association.teamMembers.filter((m) => !m.active);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href={`/associations/${id}/erp`}
              className="text-gray-600 dark:text-gray-400 hover:text-[#f67a19] font-semibold"
            >
              ← Back to ERP
            </Link>
          </div>
          <h1 className="text-5xl font-black text-[#112a60] dark:text-white font-heading mb-2">
            👥 Team Management
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Manage your association&apos;s team members and roles
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border-2 border-[#112a60]/20">
            <div className="text-4xl font-black text-[#112a60] dark:text-white">
              {activeMembers.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 font-semibold">
              Active Members
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border-2 border-[#f67a19]/20">
            <div className="text-4xl font-black text-[#f67a19]">
              {inactiveMembers.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 font-semibold">
              Inactive Members
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border-2 border-[#a5dce2]/20">
            <div className="text-4xl font-black text-[#a5dce2] dark:text-[#a5dce2]">
              {
                new Set(
                  activeMembers.map((m) => m.department).filter(Boolean)
                ).size
              }
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 font-semibold">
              Departments
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Team Member Form */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 sticky top-8 border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-black text-[#112a60] dark:text-white font-heading mb-6">
                ➕ Add Team Member
              </h2>
              <form action={addTeamMember} className="space-y-4">
                <input
                  type="hidden"
                  name="associationId"
                  value={association.id}
                />

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Position *
                  </label>
                  <input
                    type="text"
                    name="position"
                    required
                    placeholder="e.g., President, Secretary"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Role *
                  </label>
                  <select
                    name="role"
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="member">Member</option>
                    <option value="board">Board Member</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Department
                  </label>
                  <input
                    type="text"
                    name="department"
                    placeholder="e.g., Marketing, Operations"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#f67a19] hover:bg-[#e56910] text-white font-bold py-3 px-6 rounded-lg transition"
                >
                  Add Team Member
                </button>
              </form>
            </div>
          </div>

          {/* Team Members List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Members */}
            <div>
              <h2 className="text-2xl font-black text-[#112a60] dark:text-white font-heading mb-4">
                ✅ Active Members ({activeMembers.length})
              </h2>
              <div className="space-y-4">
                {activeMembers.map((member) => (
                  <details
                    key={member.id}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 group border border-gray-200 dark:border-gray-700"
                  >
                    <summary className="cursor-pointer list-none">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-xl ${
                            member.role === "board" ? "bg-[#f67a19]" : "bg-[#a5dce2]"
                          }`}>
                            {member.name[0]}
                          </div>
                          <div>
                            <h3 className="font-black text-lg text-gray-900 dark:text-gray-100">
                              {member.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {member.position}
                              {member.department && ` • ${member.department}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                              member.role === "board"
                                ? "bg-[#f67a19]/10 text-[#f67a19] border border-[#f67a19]/30"
                                : "bg-[#a5dce2]/10 text-[#112a60] dark:text-[#a5dce2] border border-[#a5dce2]/30"
                            }`}
                          >
                            {member.role === "board" ? "Board Member" : "Member"}
                          </span>
                          <span className="text-2xl group-open:rotate-180 transition-transform">
                            ▼
                          </span>
                        </div>
                      </div>
                    </summary>

                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <form action={updateTeamMember} className="space-y-4">
                        <input type="hidden" name="memberId" value={member.id} />
                        <input
                          type="hidden"
                          name="associationId"
                          value={association.id}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold mb-2">
                              Name
                            </label>
                            <input
                              type="text"
                              name="name"
                              defaultValue={member.name}
                              required
                              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold mb-2">
                              Position
                            </label>
                            <input
                              type="text"
                              name="position"
                              defaultValue={member.position}
                              required
                              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold mb-2">
                              Role
                            </label>
                            <select
                              name="role"
                              defaultValue={member.role}
                              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            >
                              <option value="member">Member</option>
                              <option value="moderator">Moderator</option>
                              <option value="admin">Admin</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold mb-2">
                              Department
                            </label>
                            <input
                              type="text"
                              name="department"
                              defaultValue={member.department || ""}
                              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold mb-2">
                              Email
                            </label>
                            <input
                              type="email"
                              name="email"
                              defaultValue={member.email || ""}
                              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold mb-2">
                              Phone
                            </label>
                            <input
                              type="tel"
                              name="phone"
                              defaultValue={member.phone || ""}
                              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-2">
                            Notes
                          </label>
                          <textarea
                            name="notes"
                            defaultValue={member.notes || ""}
                            rows={2}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-2">
                            Status
                          </label>
                          <select
                            name="active"
                            defaultValue={member.active ? "true" : "false"}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          >
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                          </select>
                        </div>

                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Joined:{" "}
                          {new Date(member.joinedAt).toLocaleDateString()}
                        </div>

                        <div className="flex gap-4">
                          <button
                            type="submit"
                            className="flex-1 bg-linear-to-r from-purple-600 to-pink-600 text-white font-semibold py-2 px-6 rounded-lg hover:scale-105 transition-all"
                          >
                            Update Member
                          </button>
                          <button
                            type="submit"
                            formAction={deleteTeamMember}
                            className="bg-red-600 text-white font-semibold py-2 px-6 rounded-lg hover:scale-105 transition-all"
                          >
                            Delete
                          </button>
                        </div>
                      </form>
                    </div>
                  </details>
                ))}

                {activeMembers.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    No active team members yet. Add your first member!
                  </div>
                )}
              </div>
            </div>

            {/* Inactive Members */}
            {inactiveMembers.length > 0 && (
              <div>
                <h2 className="text-2xl font-black text-gray-600 dark:text-gray-400 mb-4">
                  ⏸️ Inactive Members ({inactiveMembers.length})
                </h2>
                <div className="space-y-4">
                  {inactiveMembers.map((member) => (
                    <div
                      key={member.id}
                      className="bg-gray-100 dark:bg-gray-700 rounded-2xl shadow p-6"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gray-400 flex items-center justify-center text-white font-black text-xl">
                            {member.name[0]}
                          </div>
                          <div>
                            <h3 className="font-black text-lg text-gray-700 dark:text-gray-300">
                              {member.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {member.position}
                            </p>
                          </div>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
                          Inactive
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
