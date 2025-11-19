import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

async function createProject(formData: FormData) {
  "use server";

  const session = await auth();
  if (!session?.user) return;

  const associationId = formData.get("associationId") as string;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const color = formData.get("color") as string;

  const association = await prisma.associationProfile.findUnique({
    where: { id: associationId },
  });

  if (association?.userId !== session.user.id) {
    return;
  }

  await prisma.project.create({
    data: {
      associationId,
      name,
      description: description || null,
      color: color || "#6366f1",
      status: "active",
    },
  });

  revalidatePath(`/associations/${associationId}/erp/projects`);
}

async function createTask(formData: FormData) {
  "use server";

  const session = await auth();
  if (!session?.user) return;

  const projectId = formData.get("projectId") as string;
  const associationId = formData.get("associationId") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const priority = formData.get("priority") as "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  const assignedTo = formData.get("assignedTo") as string;
  const dueDateStr = formData.get("dueDate") as string;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { association: true },
  });

  if (project?.association.userId !== session.user.id) {
    return;
  }

  await prisma.projectTask.create({
    data: {
      projectId,
      title,
      description: description || null,
      priority,
      assignedTo: assignedTo || null,
      dueDate: dueDateStr ? new Date(dueDateStr) : null,
      status: "TODO",
    },
  });

  revalidatePath(`/associations/${associationId}/erp/projects`);
}

async function updateTaskStatus(formData: FormData) {
  "use server";

  const session = await auth();
  if (!session?.user) return;

  const taskId = formData.get("taskId") as string;
  const status = formData.get("status") as "TODO" | "IN_PROGRESS" | "DONE";
  const associationId = formData.get("associationId") as string;

  const task = await prisma.projectTask.findUnique({
    where: { id: taskId },
    include: { project: { include: { association: true } } },
  });

  if (task?.project.association.userId !== session.user.id) {
    return;
  }

  await prisma.projectTask.update({
    where: { id: taskId },
    data: { status },
  });

  revalidatePath(`/associations/${associationId}/erp/projects`);
}

async function deleteTask(formData: FormData) {
  "use server";

  const session = await auth();
  if (!session?.user) return;

  const taskId = formData.get("taskId") as string;
  const associationId = formData.get("associationId") as string;

  const task = await prisma.projectTask.findUnique({
    where: { id: taskId },
    include: { project: { include: { association: true } } },
  });

  if (task?.project.association.userId !== session.user.id) {
    return;
  }

  await prisma.projectTask.delete({
    where: { id: taskId },
  });

  revalidatePath(`/associations/${associationId}/erp/projects`);
}

export default async function ProjectBoards({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ project?: string }>;
}) {
  const { id } = await params;
  const { project: selectedProjectId } = await searchParams;
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const association = await prisma.associationProfile.findUnique({
    where: { id },
    include: {
      user: true,
      projects: {
        include: {
          tasks: {
            orderBy: { position: "asc" },
          },
        },
        where: { status: "active" },
      },
    },
  });

  if (!association) {
    redirect("/associations");
  }

  if (association.userId !== session.user.id) {
    redirect(`/associations/${id}`);
  }

  const selectedProject = selectedProjectId
    ? association.projects.find((p) => p.id === selectedProjectId)
    : association.projects[0];

  const totalTasks = association.projects.reduce(
    (sum, p) => sum + p.tasks.length,
    0
  );
  const completedTasks = association.projects.reduce(
    (sum, p) => sum + p.tasks.filter((t) => t.status === "DONE").length,
    0
  );

  const priorityColors = {
    LOW: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400",
    MEDIUM: "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400",
    HIGH: "bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400",
    URGENT: "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400",
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href={`/associations/${id}/erp`}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              ← Back to ERP
            </Link>
          </div>
          <h1 className="text-5xl font-black bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            📊 Project Boards
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Manage projects with Kanban boards
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-2 border-blue-200 dark:border-blue-900">
            <div className="text-4xl font-black text-blue-600 dark:text-blue-400">
              {association.projects.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Active Projects
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-2 border-purple-200 dark:border-purple-900">
            <div className="text-4xl font-black text-purple-600 dark:text-purple-400">
              {totalTasks}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Tasks
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-2 border-green-200 dark:border-green-900">
            <div className="text-4xl font-black text-green-600 dark:text-green-400">
              {completedTasks}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Completed Tasks
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Create Project */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-black text-blue-600 dark:text-blue-400 mb-4">
                ➕ New Project
              </h2>
              <form action={createProject} className="space-y-4">
                <input type="hidden" name="associationId" value={id} />
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
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Color
                  </label>
                  <input
                    type="color"
                    name="color"
                    defaultValue="#6366f1"
                    className="w-full h-10 rounded-lg"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-linear-to-r from-blue-600 to-purple-600 text-white font-semibold py-2 px-6 rounded-lg hover:scale-105 transition-all"
                >
                  Create Project
                </button>
              </form>
            </div>

            {/* Project List */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-black text-purple-600 dark:text-purple-400 mb-4">
                📁 Projects
              </h2>
              <div className="space-y-2">
                {association.projects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/associations/${id}/erp/projects?project=${project.id}`}
                    className={`block p-3 rounded-lg transition-all ${
                      selectedProject?.id === project.id
                        ? "bg-blue-100 dark:bg-blue-900 border-2 border-blue-500"
                        : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: project.color || "#6366f1" }}
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 dark:text-gray-100">
                          {project.name}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {project.tasks.length} tasks
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
                {association.projects.length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-4">
                    No projects yet
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Kanban Board */}
          <div className="lg:col-span-3">
            {selectedProject ? (
              <div>
                {/* Project Header */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="w-6 h-6 rounded-full"
                      style={{
                        backgroundColor: selectedProject.color || "#6366f1",
                      }}
                    />
                    <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100">
                      {selectedProject.name}
                    </h2>
                  </div>
                  {selectedProject.description && (
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedProject.description}
                    </p>
                  )}
                </div>

                {/* Add Task Form */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
                  <h3 className="text-xl font-black text-purple-600 dark:text-purple-400 mb-4">
                    ➕ Add Task
                  </h3>
                  <form action={createTask} className="grid grid-cols-2 gap-4">
                    <input
                      type="hidden"
                      name="projectId"
                      value={selectedProject.id}
                    />
                    <input type="hidden" name="associationId" value={id} />
                    <div>
                      <input
                        type="text"
                        name="title"
                        required
                        placeholder="Task title *"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div>
                      <select
                        name="priority"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        <option value="LOW">Low Priority</option>
                        <option value="MEDIUM" selected>
                          Medium Priority
                        </option>
                        <option value="HIGH">High Priority</option>
                        <option value="URGENT">Urgent</option>
                      </select>
                    </div>
                    <div>
                      <input
                        type="text"
                        name="assignedTo"
                        placeholder="Assigned to (optional)"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div>
                      <input
                        type="date"
                        name="dueDate"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div className="col-span-2">
                      <textarea
                        name="description"
                        placeholder="Description (optional)"
                        rows={2}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div className="col-span-2">
                      <button
                        type="submit"
                        className="w-full bg-linear-to-r from-purple-600 to-pink-600 text-white font-semibold py-2 px-6 rounded-lg hover:scale-105 transition-all"
                      >
                        Add Task
                      </button>
                    </div>
                  </form>
                </div>

                {/* Kanban Columns */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* TODO Column */}
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl p-4">
                    <h3 className="text-xl font-black text-gray-700 dark:text-gray-300 mb-4">
                      📝 To Do (
                      {
                        selectedProject.tasks.filter((t) => t.status === "TODO")
                          .length
                      }
                      )
                    </h3>
                    <div className="space-y-3">
                      {selectedProject.tasks
                        .filter((task) => task.status === "TODO")
                        .map((task) => (
                          <div
                            key={task.id}
                            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-black text-gray-900 dark:text-gray-100">
                                {task.title}
                              </h4>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-semibold ${priorityColors[task.priority]}`}
                              >
                                {task.priority}
                              </span>
                            </div>
                            {task.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                {task.description}
                              </p>
                            )}
                            {task.assignedTo && (
                              <p className="text-xs text-purple-600 dark:text-purple-400 mb-2">
                                👤 {task.assignedTo}
                              </p>
                            )}
                            {task.dueDate && (
                              <p className="text-xs text-orange-600 dark:text-orange-400 mb-2">
                                📅{" "}
                                {new Date(task.dueDate).toLocaleDateString()}
                              </p>
                            )}
                            <div className="flex gap-2">
                              <form action={updateTaskStatus} className="flex-1">
                                <input
                                  type="hidden"
                                  name="taskId"
                                  value={task.id}
                                />
                                <input
                                  type="hidden"
                                  name="associationId"
                                  value={id}
                                />
                                <input
                                  type="hidden"
                                  name="status"
                                  value="IN_PROGRESS"
                                />
                                <button
                                  type="submit"
                                  className="w-full text-xs bg-blue-600 text-white font-semibold py-1 px-2 rounded hover:bg-blue-700"
                                >
                                  Start →
                                </button>
                              </form>
                              <form action={deleteTask}>
                                <input
                                  type="hidden"
                                  name="taskId"
                                  value={task.id}
                                />
                                <input
                                  type="hidden"
                                  name="associationId"
                                  value={id}
                                />
                                <button
                                  type="submit"
                                  className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 px-2"
                                >
                                  🗑️
                                </button>
                              </form>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* IN_PROGRESS Column */}
                  <div className="bg-blue-100 dark:bg-blue-900 rounded-2xl p-4">
                    <h3 className="text-xl font-black text-blue-700 dark:text-blue-300 mb-4">
                      🚀 In Progress (
                      {
                        selectedProject.tasks.filter(
                          (t) => t.status === "IN_PROGRESS"
                        ).length
                      }
                      )
                    </h3>
                    <div className="space-y-3">
                      {selectedProject.tasks
                        .filter((task) => task.status === "IN_PROGRESS")
                        .map((task) => (
                          <div
                            key={task.id}
                            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-black text-gray-900 dark:text-gray-100">
                                {task.title}
                              </h4>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-semibold ${priorityColors[task.priority]}`}
                              >
                                {task.priority}
                              </span>
                            </div>
                            {task.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                {task.description}
                              </p>
                            )}
                            {task.assignedTo && (
                              <p className="text-xs text-purple-600 dark:text-purple-400 mb-2">
                                👤 {task.assignedTo}
                              </p>
                            )}
                            {task.dueDate && (
                              <p className="text-xs text-orange-600 dark:text-orange-400 mb-2">
                                📅{" "}
                                {new Date(task.dueDate).toLocaleDateString()}
                              </p>
                            )}
                            <div className="flex gap-2">
                              <form action={updateTaskStatus} className="flex-1">
                                <input
                                  type="hidden"
                                  name="taskId"
                                  value={task.id}
                                />
                                <input
                                  type="hidden"
                                  name="associationId"
                                  value={id}
                                />
                                <input
                                  type="hidden"
                                  name="status"
                                  value="TODO"
                                />
                                <button
                                  type="submit"
                                  className="w-full text-xs bg-gray-600 text-white font-semibold py-1 px-2 rounded hover:bg-gray-700"
                                >
                                  ← Back
                                </button>
                              </form>
                              <form action={updateTaskStatus} className="flex-1">
                                <input
                                  type="hidden"
                                  name="taskId"
                                  value={task.id}
                                />
                                <input
                                  type="hidden"
                                  name="associationId"
                                  value={id}
                                />
                                <input type="hidden" name="status" value="DONE" />
                                <button
                                  type="submit"
                                  className="w-full text-xs bg-green-600 text-white font-semibold py-1 px-2 rounded hover:bg-green-700"
                                >
                                  Done ✓
                                </button>
                              </form>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* DONE Column */}
                  <div className="bg-green-100 dark:bg-green-900 rounded-2xl p-4">
                    <h3 className="text-xl font-black text-green-700 dark:text-green-300 mb-4">
                      ✅ Done (
                      {
                        selectedProject.tasks.filter((t) => t.status === "DONE")
                          .length
                      }
                      )
                    </h3>
                    <div className="space-y-3">
                      {selectedProject.tasks
                        .filter((task) => task.status === "DONE")
                        .map((task) => (
                          <div
                            key={task.id}
                            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md opacity-75"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-black text-gray-900 dark:text-gray-100 line-through">
                                {task.title}
                              </h4>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-semibold ${priorityColors[task.priority]}`}
                              >
                                {task.priority}
                              </span>
                            </div>
                            {task.assignedTo && (
                              <p className="text-xs text-purple-600 dark:text-purple-400 mb-2">
                                👤 {task.assignedTo}
                              </p>
                            )}
                            <div className="flex gap-2">
                              <form action={updateTaskStatus} className="flex-1">
                                <input
                                  type="hidden"
                                  name="taskId"
                                  value={task.id}
                                />
                                <input
                                  type="hidden"
                                  name="associationId"
                                  value={id}
                                />
                                <input
                                  type="hidden"
                                  name="status"
                                  value="IN_PROGRESS"
                                />
                                <button
                                  type="submit"
                                  className="w-full text-xs bg-blue-600 text-white font-semibold py-1 px-2 rounded hover:bg-blue-700"
                                >
                                  ← Reopen
                                </button>
                              </form>
                              <form action={deleteTask}>
                                <input
                                  type="hidden"
                                  name="taskId"
                                  value={task.id}
                                />
                                <input
                                  type="hidden"
                                  name="associationId"
                                  value={id}
                                />
                                <button
                                  type="submit"
                                  className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 px-2"
                                >
                                  🗑️
                                </button>
                              </form>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
                <div className="text-8xl mb-6">📊</div>
                <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100 mb-4">
                  No Projects Yet
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                  Create your first project to start managing tasks with Kanban
                  boards
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
