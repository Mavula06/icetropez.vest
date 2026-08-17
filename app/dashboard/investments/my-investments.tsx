"use client";

import { useEffect, useState } from "react";

type Investment = {
  id: string;
  amount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;

  plan: {
    id: string;
    name: string;
    description: string | null;
    minimumAmount: number;
    dailyAmount: number;
    dayAmount: number;
    totalAmount: number;
    returnRate: number;
    durationDays: number;
  };

  growth: {
    daysElapsed: number;
    remainingDays: number;
    dailyEarning: number;
    earnedAmount: number;
    projectedTotal: number;
    progress: number;
    completed: boolean;
  };
};

function money(value: number) {
  return `R${value.toLocaleString("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(
    "en-ZA",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  );
}

export default function MyInvestments() {
  const [investments, setInvestments] =
    useState<Investment[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  async function loadInvestments() {
    try {
      setError("");

      const response = await fetch(
        "/api/my-investments",
        {
          cache: "no-store",
        },
      );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.error ??
            "Unable to load investments.",
        );
        return;
      }

      setInvestments(
        data.investments ?? [],
      );
    } catch {
      setError(
        "Unable to connect to the server.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInvestments();

    /*
     * Refresh every minute so the UI stays
     * current without requiring a page reload.
     */
    const interval =
      setInterval(
        loadInvestments,
        60 * 1000,
      );

    return () =>
      clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-slate-900 p-8">
        <p className="text-slate-400">
          Loading your investments...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6">
        <p className="text-red-300">
          {error}
        </p>

        <button
          type="button"
          onClick={loadInvestments}
          className="mt-4 rounded-xl bg-red-500/20 px-4 py-2 text-sm font-semibold text-red-200 hover:bg-red-500/30"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (investments.length === 0) {
    return (
      <div className="rounded-3xl border border-white/10 bg-slate-900 p-10 text-center">
        <div className="text-4xl">
          📈
        </div>

        <h2 className="mt-4 text-xl font-bold text-white">
          No investments yet
        </h2>

        <p className="mt-2 text-slate-500">
          Start an investment to see your
          earnings grow here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {investments.map(
        (investment) => (
          <InvestmentGrowthCard
            key={investment.id}
            investment={investment}
          />
        ),
      )}
    </div>
  );
}

function InvestmentGrowthCard({
  investment,
}: {
  investment: Investment;
}) {
  const {
    growth,
    plan,
  } = investment;

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl">
      {/* Header */}
      <div className="border-b border-white/10 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
              Active Investment
            </p>

            <h2 className="mt-2 text-2xl font-bold text-white">
              {plan.name}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Started{" "}
              {formatDate(
                investment.startDate,
              )}
            </p>
          </div>

          <div
            className={[
              "inline-flex w-fit rounded-full px-4 py-2 text-xs font-bold",
              growth.completed
                ? "bg-blue-400/10 text-blue-300"
                : "bg-emerald-400/10 text-emerald-300",
            ].join(" ")}
          >
            {growth.completed
              ? "COMPLETED"
              : "EARNING"}
          </div>
        </div>
      </div>

      {/* Main earnings */}
      <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl bg-white/[0.03] p-5">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Invested
          </p>

          <p className="mt-2 text-2xl font-bold text-white">
            {money(investment.amount)}
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5">
          <p className="text-xs uppercase tracking-wide text-emerald-400">
            Earned So Far
          </p>

          <p className="mt-2 text-2xl font-bold text-emerald-300">
            {money(growth.earnedAmount)}
          </p>
        </div>

        <div className="rounded-2xl bg-white/[0.03] p-5">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Daily Earnings
          </p>

          <p className="mt-2 text-2xl font-bold text-white">
            {money(growth.dailyEarning)}
          </p>
        </div>

        <div className="rounded-2xl bg-white/[0.03] p-5">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Current Value
          </p>

          <p className="mt-2 text-2xl font-bold text-emerald-400">
            {money(growth.projectedTotal)}
          </p>
        </div>
      </div>

      {/* Growth progress */}
      <div className="px-6 pb-6">
        <div className="rounded-2xl border border-white/10 bg-slate-950 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">
                Investment Growth
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Day {growth.daysElapsed} of{" "}
                {plan.durationDays}
              </p>
            </div>

            <p className="text-sm font-bold text-emerald-400">
              {growth.progress.toFixed(0)}%
            </p>
          </div>

          <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-700"
              style={{
                width: `${growth.progress}%`,
              }}
            />
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs text-slate-500">
                Days Completed
              </p>

              <p className="mt-1 font-semibold text-white">
                {growth.daysElapsed}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Days Remaining
              </p>

              <p className="mt-1 font-semibold text-white">
                {growth.remainingDays}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">
                End Date
              </p>

              <p className="mt-1 font-semibold text-white">
                {formatDate(
                  investment.endDate,
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Earnings information */}
      <div className="border-t border-white/10 bg-emerald-500/[0.03] p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-white">
              Your investment is growing
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Daily earnings are calculated
              automatically from the investment
              start date.
            </p>
          </div>

          <div className="text-left sm:text-right">
            <p className="text-xs text-slate-500">
              Next daily earning
            </p>

            <p className="mt-1 font-bold text-emerald-400">
              +{money(growth.dailyEarning)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}