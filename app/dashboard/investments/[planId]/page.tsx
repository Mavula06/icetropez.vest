import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import InvestmentConfirmation from "./investment-confirmation";

function money(value: unknown) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 2,
  }).format(Number(value));
}

type PageProps = {
  params: Promise<{
    planId: string;
  }>;
};

export default async function InvestmentPlanPage({
  params,
}: PageProps) {
  const user = await getCurrentUser();

  if (!user) {
    notFound();
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

  const wallet = await prisma.wallet.findUnique({
    where: {
      userId: user.id,
    },
  });

  const walletBalance = Number(wallet?.availableBalance ?? 0);
  const minimumAmount = Number(plan.minimumAmount);
  const totalAmount = Number(plan.totalAmount);

  const returnRate =
    minimumAmount > 0
      ? ((totalAmount - minimumAmount) / minimumAmount) * 100
      : 0;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">

        <div className="mb-8">
          <Link
            href="/dashboard/investments"
            className="text-sm text-emerald-400 hover:text-emerald-300"
          >
             Investment Plans
          </Link>

          <div className="mt-8">
            <p className="text-sm font-medium uppercase tracking-wider text-emerald-400">
              Investment Plan
            </p>

            <h1 className="mt-2 text-4xl font-bold tracking-tight">
              {plan.name}
            </h1>

            <p className="mt-3 max-w-2xl text-slate-400">
              {plan.description ??
                "Investment opportunity available on Icetropez.Vest."}
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">

          <div className="rounded-3xl border border-white/10 bg-slate-900 p-7">
            <p className="text-sm text-slate-500">
              Return Rate
            </p>

            <p className="mt-2 text-3xl font-bold text-emerald-400">
              {returnRate.toFixed(2)}%
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Total payout: {money(plan.totalAmount)}
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

            <p className="mt-2 text-sm text-slate-500">
              Daily amount: {money(plan.dailyAmount)}
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

            {walletBalance < minimumAmount ? (
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
              <div className="mt-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">

                <p className="font-medium text-emerald-400">
                  You have enough funds to invest in this plan.
                </p>

                <p className="mt-1 text-sm text-emerald-300/70">
                  Your available balance is {money(walletBalance)}.
                </p>

              </div>
            )}

          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950 p-5">

            <h3 className="text-lg font-semibold">
              Investment Summary
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Review the investment amount, duration and total payout
              before confirming your investment.
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Investment
                </p>

                <p className="mt-1 font-semibold">
                  {money(plan.minimumAmount)}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Duration
                </p>

                <p className="mt-1 font-semibold">
                  {plan.durationDays} days
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Total payout
                </p>

                <p className="mt-1 font-semibold text-emerald-400">
                  {money(plan.totalAmount)}
                </p>
              </div>

            </div>

          </div>

          {walletBalance >= minimumAmount && (
            <InvestmentConfirmation
  planId={plan.id}
  planName={plan.name}
  minimumAmount={minimumAmount}
  totalAmount={totalAmount}
  durationDays={plan.durationDays}
  walletBalance={walletBalance}
/>
          )}

        </div>

      </div>
    </main>
  );
}
