import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function money(value: unknown) {
  return Number(value ?? 0).toLocaleString("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 2,
  });
}

export default async function InvestmentPlanPage({
  params,
}: {
  params: Promise<{ planId: string }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { planId } = await params;

  const plan = await prisma.investmentPlan.findFirst({
    where: {
      id: planId,
      isActive: true,
    },
  });

  if (!plan) {
    notFound();
  }

  const walletBalance = Number(
    user.wallet?.availableBalance ?? 0,
  );

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-slate-900/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/dashboard" className="text-xl font-bold">
            Icetropez<span className="text-emerald-400">.Vest</span>
          </Link>

          <Link
            href="/dashboard/investments"
            className="text-sm text-slate-400 hover:text-white"
          >
            ← Investment Plans
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-400">
            Investment Plan
          </p>

          <h1 className="mt-2 text-4xl font-bold">
            {plan.name}
          </h1>

          <p className="mt-3 max-w-2xl text-slate-400">
            {plan.description ??
              "Investment opportunity available on Icetropez.Vest."}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-slate-900 p-7">
            <p className="text-sm text-slate-500">
              Return Rate
            </p>

            <p className="mt-2 text-3xl font-bold text-emerald-400">
              {Number(plan.returnRate)}%
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-900 p-7">
            <p className="text-sm text-slate-500">
              Duration
            </p>

            <p className="mt-2 text-3xl font-bold">
              {plan.durationDays}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              days
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-900 p-7">
            <p className="text-sm text-slate-500">
              Minimum Investment
            </p>

            <p className="mt-2 text-2xl font-bold">
              {money(plan.minimumAmount)}
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-emerald-500/20 bg-slate-900 p-7">
          <h2 className="text-2xl font-bold">
            Start your investment
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Available wallet balance:{" "}
            <span className="font-semibold text-emerald-400">
              {money(walletBalance)}
            </span>
          </p>

          <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950 p-5">
            <p className="text-sm text-slate-500">
              Minimum amount required
            </p>

            <p className="mt-1 text-xl font-bold">
              {money(plan.minimumAmount)}
            </p>

            {walletBalance < Number(plan.minimumAmount) ? (
              <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
                <p className="font-medium text-red-400">
                  Insufficient wallet balance
                </p>

                <p className="mt-1 text-sm text-red-300/70">
                  Deposit funds into your wallet before investing.
                </p>

                <Link
                  href="/dashboard/deposit"
                  className="mt-4 inline-block rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
                >
                  Deposit Funds
                </Link>
              </div>
            ) : (
              <div className="mt-5">
                <p className="text-sm text-slate-400">
                  You have enough funds to invest in this plan.
                </p>

                <button
                  type="button"
                  disabled
                  className="mt-5 w-full rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 opacity-50"
                >
                  Investment Form — Next Step
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-5">
          <p className="text-sm leading-6 text-yellow-200/80">
            Review the investment plan terms, amount, duration and
            return rate before confirming an investment.
          </p>
        </div>
      </div>
    </main>
  );
}
