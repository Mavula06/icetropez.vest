import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import LogoutButton from "./logout-button";

function money(value: unknown) {
  return Number(value ?? 0).toLocaleString("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 2,
  });
}

function date(value: Date) {
  return new Intl.DateTimeFormat("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value);
}

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const [investments, transactions, referralCount] =
    await Promise.all([
      prismaInvestmentData(user.id),
      prismaTransactionData(user.id),
      prismaReferralCount(user.id),
    ]);

  const totalInvested = investments.reduce(
    (total, investment) => total + Number(investment.amount),
    0,
  );

  const totalEarned = investments.reduce(
    (total, investment) => total + Number(investment.earnedAmount),
    0,
  );

  const activeInvestments = investments.filter(
    (investment) => investment.isActive,
  ).length;

  const walletBalance = Number(user.wallet?.balance ?? 0);
  const availableBalance = Number(
    user.wallet?.availableBalance ?? 0,
  );

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-slate-900/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-xl font-bold sm:text-2xl">
            Icetropez<span className="text-emerald-400">.Vest</span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-slate-500">
                {user.email}
              </p>
            </div>

            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <p className="text-sm text-emerald-400">Dashboard</p>

          <h1 className="mt-1 text-3xl font-bold sm:text-4xl">
            Welcome back, {user.firstName} 👋
          </h1>

          <p className="mt-2 text-slate-400">
            Here's an overview of your Icetropez.Vest account.
          </p>
        </div>

        {/* Wallet */}
        <section className="grid gap-5 md:grid-cols-2">
          <div className="rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/20 to-slate-900 p-7">
            <p className="text-sm text-slate-400">Total Wallet Balance</p>

            <p className="mt-3 text-4xl font-bold">
              {money(walletBalance)}
            </p>

            <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
              <span className="text-sm text-slate-400">
                Available
              </span>

              <span className="font-semibold text-emerald-400">
                {money(availableBalance)}
              </span>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-900 p-7">
            <p className="text-sm text-slate-400">
              Your Referral Code
            </p>

            <div className="mt-4 rounded-2xl border border-dashed border-emerald-500/40 bg-emerald-500/5 p-5">
              <p className="break-all text-xl font-bold tracking-wider text-emerald-400">
                {user.referralCode}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                Share this code with friends to earn referral rewards.
              </p>
            </div>

            <p className="mt-5 text-sm text-slate-400">
              Successful referrals:{" "}
              <span className="font-semibold text-white">
                {referralCount}
              </span>
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon="📈"
            title="Total Invested"
            value={money(totalInvested)}
          />

          <StatCard
            icon="💎"
            title="Total Earnings"
            value={money(totalEarned)}
          />

          <StatCard
            icon="🚀"
            title="Active Investments"
            value={String(activeInvestments)}
          />

          <StatCard
            icon="👥"
            title="Referrals"
            value={String(referralCount)}
          />
        </section>

        {/* Quick actions */}
        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          <ActionCard
            href="/dashboard/deposit"
            icon="💰"
            title="Deposit"
            description="Add funds to your wallet"
          />

          <ActionCard
            href="/dashboard/investments"
            icon="📊"
            title="Invest"
            description="View available investment plans"
          />

          <ActionCard
            href="/dashboard/withdraw"
            icon="🏦"
            title="Withdraw"
            description="Request a withdrawal"
          />
        </section>

        {/* Recent transactions */}
        <section className="mt-8 rounded-3xl border border-white/10 bg-slate-900">
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
            <div>
              <h2 className="text-xl font-bold">
                Recent Transactions
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your latest account activity.
              </p>
            </div>

            <Link
              href="/dashboard/transactions"
              className="text-sm font-medium text-emerald-400 hover:text-emerald-300"
            >
              View all
            </Link>
          </div>

          {transactions.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="text-4xl">🧾</div>

              <p className="mt-4 font-medium">
                No transactions yet
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Your transactions will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between gap-4 px-6 py-5"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/5">
                      {transactionIcon(transaction.type)}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {transaction.description ||
                          formatTransactionType(transaction.type)}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {date(transaction.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold">
                      {money(transaction.amount)}
                    </p>

                    <p
                      className={`mt-1 text-xs ${
                        transaction.status === "COMPLETED"
                          ? "text-emerald-400"
                          : transaction.status === "FAILED"
                            ? "text-red-400"
                            : "text-amber-400"
                      }`}
                    >
                      {transaction.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Investments */}
        <section className="mt-8 rounded-3xl border border-white/10 bg-slate-900">
          <div className="border-b border-white/10 px-6 py-5">
            <h2 className="text-xl font-bold">
              Your Investments
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Current and previous investments.
            </p>
          </div>

          {investments.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="text-4xl">📈</div>

              <p className="mt-4 font-medium">
                No investments yet
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Your investments will appear here once created.
              </p>

              <Link
                href="/dashboard/investments"
                className="mt-5 inline-flex rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
              >
                Explore Investments
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {investments.map((investment) => (
                <div
                  key={investment.id}
                  className="grid gap-4 px-6 py-5 md:grid-cols-4"
                >
                  <div>
                    <p className="text-xs text-slate-500">
                      Plan
                    </p>
                    <p className="mt-1 font-semibold">
                      {investment.plan.name}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Invested
                    </p>
                    <p className="mt-1 font-semibold">
                      {money(investment.amount)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Earned
                    </p>
                    <p className="mt-1 font-semibold text-emerald-400">
                      {money(investment.earnedAmount)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Status
                    </p>
                    <p
                      className={`mt-1 font-semibold ${
                        investment.isActive
                          ? "text-emerald-400"
                          : "text-slate-400"
                      }`}
                    >
                      {investment.isActive ? "ACTIVE" : "COMPLETED"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <footer className="py-10 text-center text-xs text-slate-600">
          Icetropez.Vest • Account dashboard
        </footer>
      </div>
    </main>
  );
}

async function prismaInvestmentData(userId: string) {
  const { prisma } = await import("@/lib/prisma");

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

async function prismaTransactionData(userId: string) {
  const { prisma } = await import("@/lib/prisma");

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

async function prismaReferralCount(userId: string) {
  const { prisma } = await import("@/lib/prisma");

  return prisma.referral.count({
    where: {
      referrerId: userId,
    },
  });
}


function formatTransactionType(type: string) {
  return type
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function transactionIcon(type: string) {
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
}: {
  icon: string;
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="mt-2 text-xl font-bold text-white">{value}</p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 text-xl">
          {icon}
        </div>
      </div>
    </div>
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
      className="group rounded-2xl border border-white/10 bg-slate-900 p-5 transition hover:-translate-y-1 hover:border-emerald-400/30"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-2xl">
          {icon}
        </div>

        <div>
          <h3 className="font-semibold text-white group-hover:text-emerald-400">
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
