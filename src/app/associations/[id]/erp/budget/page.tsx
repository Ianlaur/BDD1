import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

async function addTransaction(formData: FormData) {
  "use server";

  const session = await auth();
  if (!session?.user) return;

  const associationId = formData.get("associationId") as string;
  const type = formData.get("type") as "INCOME" | "EXPENSE";
  const amount = parseFloat(formData.get("amount") as string);
  const category = formData.get("category") as string;
  const description = formData.get("description") as string;
  const date = new Date(formData.get("date") as string);

  const association = await prisma.associationProfile.findUnique({
    where: { id: associationId },
  });

  if (association?.userId !== session.user.id) {
    return;
  }

  await prisma.budgetTransaction.create({
    data: {
      associationId,
      type,
      amount,
      category,
      description,
      date,
      createdBy: session.user.name || session.user.email || "Unknown",
    },
  });

  revalidatePath(`/associations/${associationId}/erp/budget`);
}

async function deleteTransaction(formData: FormData) {
  "use server";

  const session = await auth();
  if (!session?.user) return;

  const transactionId = formData.get("transactionId") as string;
  const associationId = formData.get("associationId") as string;

  const association = await prisma.associationProfile.findUnique({
    where: { id: associationId },
  });

  if (association?.userId !== session.user.id) {
    return;
  }

  await prisma.budgetTransaction.delete({
    where: { id: transactionId },
  });

  revalidatePath(`/associations/${associationId}/erp/budget`);
}

export default async function BudgetManagement({
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
      budgetTransactions: {
        orderBy: { date: "desc" },
      },
    },
  });

  if (!association) {
    redirect("/associations");
  }

  if (association.userId !== session.user.id) {
    redirect(`/associations/${id}`);
  }

  // Calculate stats
  const totalIncome = association.budgetTransactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = association.budgetTransactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  // Group by category
  const incomeByCategory = association.budgetTransactions
    .filter((t) => t.type === "INCOME")
    .reduce(
      (acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      },
      {} as Record<string, number>
    );

  const expensesByCategory = association.budgetTransactions
    .filter((t) => t.type === "EXPENSE")
    .reduce(
      (acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      },
      {} as Record<string, number>
    );

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
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
          <h1 className="text-5xl font-black bg-linear-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            💰 Budget Management
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Track your association&apos;s income and expenses
          </p>
        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-2 border-green-200 dark:border-green-900">
            <div className="text-green-600 dark:text-green-400 text-2xl mb-2">
              💵
            </div>
            <div className="text-4xl font-black text-green-600 dark:text-green-400 mb-1">
              ${totalIncome.toFixed(2)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Income (
              {
                association.budgetTransactions.filter(
                  (t) => t.type === "INCOME"
                ).length
              }{" "}
              transactions)
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-2 border-red-200 dark:border-red-900">
            <div className="text-red-600 dark:text-red-400 text-2xl mb-2">
              💸
            </div>
            <div className="text-4xl font-black text-red-600 dark:text-red-400 mb-1">
              ${totalExpenses.toFixed(2)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Expenses (
              {
                association.budgetTransactions.filter(
                  (t) => t.type === "EXPENSE"
                ).length
              }{" "}
              transactions)
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-2 border-blue-200 dark:border-blue-900">
            <div className="text-blue-600 dark:text-blue-400 text-2xl mb-2">
              💎
            </div>
            <div
              className={`text-4xl font-black mb-1 ${
                balance >= 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              ${balance.toFixed(2)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {balance >= 0 ? "Surplus" : "Deficit"}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Transaction Form */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sticky top-8">
              <h2 className="text-2xl font-black text-green-600 dark:text-green-400 mb-6">
                ➕ Add Transaction
              </h2>
              <form action={addTransaction} className="space-y-4">
                <input
                  type="hidden"
                  name="associationId"
                  value={association.id}
                />

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Type *
                  </label>
                  <select
                    name="type"
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="INCOME">Income</option>
                    <option value="EXPENSE">Expense</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Amount ($) *
                  </label>
                  <input
                    type="number"
                    name="amount"
                    step="0.01"
                    min="0"
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Category *
                  </label>
                  <input
                    type="text"
                    name="category"
                    required
                    placeholder="e.g., Membership Fees, Event Costs"
                    list="categories"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                  <datalist id="categories">
                    <option value="Membership Fees" />
                    <option value="Donations" />
                    <option value="Fundraising" />
                    <option value="Sponsorships" />
                    <option value="Event Revenue" />
                    <option value="Event Costs" />
                    <option value="Marketing" />
                    <option value="Supplies" />
                    <option value="Technology" />
                    <option value="Venue Rental" />
                    <option value="Food & Beverage" />
                    <option value="Other" />
                  </datalist>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    required
                    defaultValue={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    required
                    rows={4}
                    placeholder="Describe this transaction..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-linear-to-r from-green-600 to-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:scale-105 transition-all"
                >
                  Add Transaction
                </button>
              </form>
            </div>
          </div>

          {/* Transactions List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Category Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Income by Category */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-black text-green-600 dark:text-green-400 mb-4">
                  💵 Income by Category
                </h3>
                {Object.keys(incomeByCategory).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(incomeByCategory).map(([cat, amount]) => (
                      <div
                        key={cat}
                        className="flex items-center justify-between p-3 bg-green-50 dark:bg-gray-700 rounded-lg"
                      >
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          {cat}
                        </span>
                        <span className="text-green-600 dark:text-green-400 font-black">
                          ${amount.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No income recorded yet
                  </p>
                )}
              </div>

              {/* Expenses by Category */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-black text-red-600 dark:text-red-400 mb-4">
                  💸 Expenses by Category
                </h3>
                {Object.keys(expensesByCategory).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(expensesByCategory).map(([cat, amount]) => (
                      <div
                        key={cat}
                        className="flex items-center justify-between p-3 bg-red-50 dark:bg-gray-700 rounded-lg"
                      >
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          {cat}
                        </span>
                        <span className="text-red-600 dark:text-red-400 font-black">
                          ${amount.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No expenses recorded yet
                  </p>
                )}
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h3 className="text-2xl font-black text-blue-600 dark:text-blue-400 mb-4">
                📋 Transaction History
              </h3>
              <div className="space-y-3">
                {association.budgetTransactions.length > 0 ? (
                  association.budgetTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className={`p-4 rounded-xl border-2 ${
                        transaction.type === "INCOME"
                          ? "bg-green-50 dark:bg-gray-700 border-green-200 dark:border-green-900"
                          : "bg-red-50 dark:bg-gray-700 border-red-200 dark:border-red-900"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                transaction.type === "INCOME"
                                  ? "bg-green-200 dark:bg-green-900 text-green-700 dark:text-green-300"
                                  : "bg-red-200 dark:bg-red-900 text-red-700 dark:text-red-300"
                              }`}
                            >
                              {transaction.type}
                            </span>
                            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                              {transaction.category}
                            </span>
                          </div>
                          <p className="text-gray-900 dark:text-gray-100 font-medium">
                            {transaction.description}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-600 dark:text-gray-400">
                            <span>
                              {new Date(transaction.date).toLocaleDateString()}
                            </span>
                            {transaction.createdBy && (
                              <span>By: {transaction.createdBy}</span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={`text-2xl font-black ${
                              transaction.type === "INCOME"
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {transaction.type === "INCOME" ? "+" : "-"}$
                            {transaction.amount.toFixed(2)}
                          </div>
                          <form action={deleteTransaction}>
                            <input
                              type="hidden"
                              name="transactionId"
                              value={transaction.id}
                            />
                            <input
                              type="hidden"
                              name="associationId"
                              value={association.id}
                            />
                            <button
                              type="submit"
                              className="mt-2 text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            >
                              Delete
                            </button>
                          </form>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    No transactions yet. Add your first transaction to start
                    tracking your budget!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
