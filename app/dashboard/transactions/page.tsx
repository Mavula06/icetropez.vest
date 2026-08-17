import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function money(value: unknown) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0));
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

export default async function TransactionsPage() {
  const user = await getCurrentUser();

  if (!user) {
    notFound();
  }

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 50,
  });

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">

        <div className="mb-8">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-emerald-400 hover:text-emerald-300"
          >
            ← Dashboard
          </Link>

          <div className="mt-6">
            <p className="text-sm font-semibold uppercase tracking-widest text-emerald-400">
              Account Activity
            </p>

            <h1 className="mt-2 text-4xl font-bold">
              Transactions
            </h1>

            <p className="mt-3 text-slate-400">
              View your deposits, withdrawals, investments and wallet
              activity.
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900">

          <div className="border-b border-white/10 p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  Recent Transactions
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Your latest account activity
                </p>
              </div>

              <div className="rounded-full bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-400">
                {transactions.length} transaction
                {transactions.length === 1 ? "" : "s"}
              </div>
            </div>
          </div>

          {transactions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-4xl">↔</div>

              <h3 className="mt-4 text-xl font-bold">
                No transactions yet
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Your account activity will appear here once you make a
                deposit, investment or withdrawal.
              </p>

              <Link
                href="/dashboard/deposit"
                className="mt-6 inline-block rounded-xl bg-emerald-500 px-6 py-3 text-sm font-bold text-slate-950 hover:bg-emerald-400"
              >
                Make a Deposit
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {transactions.map((transaction) => {
                const amount = Number(transaction.amount ?? 0);

                const transactionType =
                  String(
                    (transaction as { type?: unknown }).type ??
                    "TRANSACTION",
                  );

                const status =
                  String(
                    (transaction as { status?: unknown }).status ??
                    "COMPLETED",
                  );

                const isPositive = amount >= 0;

                return (
                  <div
                    key={transaction.id}
                    className="flex flex-col gap-4 p-6 transition hover:bg-white/[0.02] sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={[
                          "flex h-11 w-11 items-center justify-center rounded-full text-lg",
                          isPositive
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-red-500/10 text-red-400",
                        ].join(" ")}
                      >
                        {isPositive ? "+" : "−"}
                      </div>

                      <div>
                        <p className="font-semibold text-white">
                          {transactionType.replaceAll("_", " ")}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {formatDate(transaction.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <p
                        className={[
                          "text-lg font-bold",
                          isPositive
                            ? "text-emerald-400"
                            : "text-red-400",
                        ].join(" ")}
                      >
                        {isPositive ? "+" : ""}
                        {money(amount)}
                      </p>

                      <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">
                        {status}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}