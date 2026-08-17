import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { syncInvestmentEarnings } from "@/lib/investment-earnings";

import LogoutButton from "./logout-button";

function money(value: unknown) {
  return Number(value ?? 0).toLocaleString(
    "en-ZA",
    {
      style: "currency",
      currency: "ZAR",
      minimumFractionDigits: 2,
    },
  );
}

function date(value: Date) {
  return new Intl.DateTimeFormat(
    "en-ZA",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  ).format(value);
}

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  /*
   * Synchronize investment earnings with
   * the actual wallet before displaying
   * balances and totals.
   */
  await syncInvestmentEarnings(
    user.id,
  );

  const [
    investments,
    transactions,
    referralCount,
  ] = await Promise.all([
    prismaInvestmentData(user.id),
    prismaTransactionData(user.id),
    prismaReferralCount(user.id),
  ]);

  const totalInvested =
    investments.reduce(
      (total, investment) =>
        total +
        Number(investment.amount),
      0,
    );

  const totalEarned =
    investments.reduce(
      (total, investment) =>
        total +
        Number(
          investment.earnedAmount,
        ),
      0,
    );

  const activeInvestments =
    investments.filter(
      (investment) =>
        investment.isActive,
    ).length;

  const walletBalance =
    Number(
      user.wallet?.balance ?? 0,
    );

  const availableBalance =
    Number(
      user.wallet
        ?.availableBalance ?? 0,
    );

  return (
    <main className="min-h-screen text-slate-900">

      <header className="sticky top-0 z-40 border-b border-white/60 bg-white/70 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">

          <Link
            href="/"
            className="group flex items-center gap-2"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-lg font-black text-white shadow-lg">
              I
            </div>

            <div>
              <div className="text-lg font-black tracking-tight text-slate-900">
                Icetropez
                <span className="text-emerald-600">
                  .Vest
                </span>
              </div>

              <div className="hidden text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400 sm:block">
                Investment Platform
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-bold text-slate-800">
                {user.firstName}{" "}
                {user.lastName}
              </p>

              <p className="text-xs text-slate-500">
                {user.email}
              </p>
            </div>

            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">

        <section className="mb-7">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/70 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700 backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Account Overview
              </div>

              <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                Welcome back,{" "}
                <span className="text-emerald-600">
                  {user.firstName}
                </span>
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                Manage your investments,
                track your earnings,
                deposit funds and
                monitor your
                Icetropez.Vest portfolio
                from one place.
              </p>
            </div>

          </div>
        </section>

        <section className="relative overflow-hidden rounded-[32px] border border-white/70 bg-white/70 shadow-2xl shadow-slate-900/10 backdrop-blur-2xl">

          <div className="absolute inset-y-0 right-0 hidden w-[48%] overflow-hidden lg:block">

            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('/icetropez-background.png')",
              }}
            />

            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/75 to-white/10" />
          </div>

          <div className="relative grid lg:grid-cols-[1.1fr_0.9fr]">

            <div className="p-6 sm:p-8 lg:p-10">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Total Wallet Balance
                  </p>

                  <p className="mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
                    {money(walletBalance)}
                  </p>
                </div>

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-2xl shadow-inner">
                  💰
                </div>

              </div>

              <div className="mt-7 flex items-center justify-between rounded-2xl border border-emerald-100 bg-emerald-50/80 px-5 py-4">

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700/70">
                    Available to use
                  </p>

                  <p className="mt-1 text-xl font-black text-emerald-700">
                    {money(availableBalance)}
                  </p>
                </div>

                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                  AVAILABLE
                </span>
              </div>

              <div className="mt-7 grid grid-cols-3 gap-3">

                <ActionButton
                  href="/dashboard/deposit"
                  icon="↓"
                  title="Deposit"
                />

                <ActionButton
                  href="/dashboard/investments"
                  icon="↗"
                  title="Invest"
                />

                <ActionButton
                  href="/dashboard/withdraw"
                  icon="↑"
                  title="Withdraw"
                />

              </div>

            </div>

            <div className="relative hidden min-h-[300px] lg:block">

              <div className="absolute bottom-8 right-8 max-w-xs rounded-3xl border border-white/70 bg-white/65 p-5 shadow-xl backdrop-blur-xl">

                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
                  Icetropez.Vest
                </p>

                <h2 className="mt-2 text-xl font-black text-slate-900">
                  Grow your financial future.
                </h2>

                <p className="mt-2 text-sm leading-5 text-slate-600">
                  Keep track of your money
                  and make informed
                  investment decisions
                  from your dashboard.
                </p>

              </div>
            </div>

          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <StatCard
            icon="📈"
            title="Total Invested"
            value={money(totalInvested)}
            accent="emerald"
          />

          <StatCard
            icon="💎"
            title="Total Earnings"
            value={money(totalEarned)}
            accent="blue"
          />

          <StatCard
            icon="🚀"
            title="Active Investments"
            value={String(activeInvestments)}
            accent="purple"
          />

          <StatCard
            icon="👥"
            title="Referrals"
            value={String(referralCount)}
            accent="orange"
          />

        </section>

        <section className="mt-8">

          <div className="mb-4">
            <h2 className="text-xl font-black text-slate-900">
              Quick Actions
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Manage your account in a few clicks.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">

            <ActionCard
              href="/dashboard/deposit"
              icon="💰"
              title="Deposit Funds"
              description="Add money to your wallet"
            />

            <ActionCard
              href="/dashboard/investments"
              icon="📊"
              title="Explore Investments"
              description="View available investment plans"
            />

            <ActionCard
              href="/dashboard/withdraw"
              icon="🏦"
              title="Withdraw Funds"
              description="Request a withdrawal"
            />

          </div>

        </section>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">

          <section className="overflow-hidden rounded-[28px] border border-white/70 bg-white/70 shadow-xl backdrop-blur-2xl">

            <div className="flex items-center justify-between border-b border-slate-200/70 px-6 py-5">

              <div>
                <h2 className="font-black text-slate-900">
                  Recent Transactions
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Your latest account activity
                </p>
              </div>

              <Link
                href="/dashboard/transactions"
                className="text-xs font-bold text-emerald-600"
              >
                View all →
              </Link>

            </div>

            {transactions.length === 0 ? (

              <div className="px-6 py-12 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                  🧾
                </div>

                <p className="mt-4 font-bold text-slate-800">
                  No transactions yet
                </p>
              </div>

            ) : (

              <div className="divide-y divide-slate-200/60">

                {transactions.map(
                  (transaction) => (

                    <div
                      key={
                        transaction.id
                      }
                      className="flex items-center justify-between gap-4 px-6 py-4"
                    >

                      <div className="flex min-w-0 items-center gap-3">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-lg">
                          {transactionIcon(
                            transaction.type,
                          )}
                        </div>

                        <div className="min-w-0">

                          <p className="truncate text-sm font-bold text-slate-800">
                            {transaction.description ||
                              formatTransactionType(
                                transaction.type,
                              )}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {date(
                              transaction.createdAt,
                            )}
                          </p>

                        </div>
                      </div>

                      <div className="shrink-0 text-right">

                        <p className="text-sm font-black text-slate-800">
                          {money(
                            transaction.amount,
                          )}
                        </p>

                        <p className="mt-1 text-[10px] font-bold uppercase text-emerald-600">
                          {transaction.status}
                        </p>

                      </div>

                    </div>
                  ),
                )}

              </div>
            )}

          </section>

          <section className="overflow-hidden rounded-[28px] border border-white/70 bg-white/70 shadow-xl backdrop-blur-2xl">

            <div className="flex items-center justify-between border-b border-slate-200/70 px-6 py-5">

              <div>
                <h2 className="font-black text-slate-900">
                  Your Investments
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Current portfolio
                </p>
              </div>

              <Link
                href="/dashboard/investments"
                className="text-xs font-bold text-emerald-600"
              >
                Explore →
              </Link>

            </div>

            <div className="divide-y divide-slate-200/60">

              {investments.map(
                (investment) => (

                  <div
                    key={
                      investment.id
                    }
                    className="px-6 py-5"
                  >

                    <div className="flex items-start justify-between gap-4">

                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Investment Plan
                        </p>

                        <p className="mt-1 font-black text-slate-900">
                          {investment.plan.name}
                        </p>
                      </div>

                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-black text-emerald-700">
                        {investment.isActive
                          ? "ACTIVE"
                          : "COMPLETED"}
                      </span>

                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-4">

                      <div>
                        <p className="text-xs text-slate-400">
                          Invested
                        </p>

                        <p className="mt-1 font-black text-slate-800">
                          {money(
                            investment.amount,
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">
                          Earned
                        </p>

                        <p className="mt-1 font-black text-emerald-600">
                          {money(
                            investment.earnedAmount,
                          )}
                        </p>
                      </div>

                    </div>

                  </div>
                ),
              )}

            </div>

          </section>

        </div>

        <footer className="py-10 text-center">
          <p className="text-xs font-medium text-slate-400">
            Icetropez.Vest • Secure investment dashboard
          </p>
        </footer>

      </div>
    </main>
  );
}

async function prismaInvestmentData(
  userId: string,
) {
  const { prisma } =
    await import("@/lib/prisma");

  return prisma.investment.findMany({
    where: {
      userId,
    },
    include: {
      plan: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 10,
  });
}

async function prismaTransactionData(
  userId: string,
) {
  const { prisma } =
    await import("@/lib/prisma");

  return prisma.transaction.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 10,
  });
}

async function prismaReferralCount(
  userId: string,
) {
  const { prisma } =
    await import("@/lib/prisma");

  return prisma.referral.count({
    where: {
      referrerId: userId,
    },
  });
}

function formatTransactionType(
  type: string,
) {
  return type
    .toLowerCase()
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase(),
    );
}

function transactionIcon(
  type: string,
) {
  switch (type) {
    case "DEPOSIT":
      return "💰";

    case "WITHDRAWAL":
      return "🏦";

    case "INVESTMENT":
      return "📈";

    case "INVESTMENT_RETURN":
      return "💎";

    case "REFERRAL_REWARD":
      return "🎁";

    default:
      return "💳";
  }
}

function StatCard({
  icon,
  title,
  value,
  accent,
}: {
  icon: string;
  title: string;
  value: string;
  accent: string;
}) {
  const accentClasses: Record<
    string,
    string
  > = {
    emerald:
      "bg-emerald-100 text-emerald-700",
    blue:
      "bg-blue-100 text-blue-700",
    purple:
      "bg-purple-100 text-purple-700",
    orange:
      "bg-orange-100 text-orange-700",
  };

  return (
    <div className="rounded-[24px] border border-white/70 bg-white/70 p-5 shadow-lg backdrop-blur-xl">

      <div className="flex items-center justify-between gap-4">

        <div className="min-w-0">

          <p className="truncate text-xs font-bold uppercase tracking-wider text-slate-400">
            {title}
          </p>

          <p className="mt-2 truncate text-xl font-black text-slate-900">
            {value}
          </p>

        </div>

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl ${
            accentClasses[
              accent
            ] ??
            accentClasses.emerald
          }`}
        >
          {icon}
        </div>

      </div>
    </div>
  );
}

function ActionButton({
  href,
  icon,
  title,
}: {
  href: string;
  icon: string;
  title: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center rounded-2xl border border-slate-200/80 bg-white/75 px-3 py-4 text-center shadow-sm transition hover:border-emerald-300 hover:bg-white"
    >
      <span className="text-xl font-black text-slate-900">
        {icon}
      </span>

      <span className="mt-1 text-xs font-bold text-slate-700">
        {title}
      </span>
    </Link>
  );
}

function ActionCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-[24px] border border-white/70 bg-white/70 p-5 shadow-lg backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white"
    >
      <div className="flex items-center gap-4">

        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-2xl shadow-lg group-hover:bg-emerald-600">
          {icon}
        </div>

        <div>
          <h3 className="font-black text-slate-900">
            {title}
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            {description}
          </p>
        </div>

      </div>
    </Link>
  );
}