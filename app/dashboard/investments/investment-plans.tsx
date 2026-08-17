"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type InvestmentPlan = {
  id: string;
  name: string;
  description?: string | null;
  minimumAmount: string | number;
  dailyAmount: string | number;
  dayAmount: string | number;
  totalAmount: string | number;
  returnRate: string | number;
  durationDays: number;
};

function formatRand(amount: number) {
  return `R${amount.toLocaleString("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function numberValue(value: string | number) {
  return Number(value);
}

export default function InvestmentPlans() {
  const [plans, setPlans] = useState<InvestmentPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPlans() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/investments", {
          method: "GET",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data?.error ?? "Unable to load investment plans.");
          return;
        }

        const databasePlans: InvestmentPlan[] = data.plans ?? [];

        /*
         * Only display the five Icetropez plans.
         *
         * We use the REAL database ID from each plan.
         * We do NOT match plans by array index.
         */
        const icetropezPlans = databasePlans
          .filter((plan) =>
            /^ICETROPEZ PLAN-[A-E]$/i.test(plan.name),
          )
          .sort((a, b) => {
            const aLetter = a.name.slice(-1).toUpperCase();
            const bLetter = b.name.slice(-1).toUpperCase();

            return aLetter.localeCompare(bLetter);
          });

        setPlans(icetropezPlans);
      } catch (error) {
        console.error("Unable to load investment plans:", error);
        setError("Unable to connect to the server.");
      } finally {
        setLoading(false);
      }
    }

    loadPlans();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3, 4, 5].map((item) => (
          <div
            key={item}
            className="h-[390px] animate-pulse rounded-3xl border border-white/10 bg-slate-900/70"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-red-300">
        {error}
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-slate-900 p-8 text-center">
        <h2 className="text-xl font-bold text-white">
          No investment plans available
        </h2>

        <p className="mt-2 text-slate-400">
          Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {plans.map((plan, index) => (
        <InvestmentCard
          key={plan.id}
          plan={plan}
          featured={index === 1}
        />
      ))}
    </div>
  );
}

function InvestmentCard({
  plan,
  featured,
}: {
  plan: InvestmentPlan;
  featured?: boolean;
}) {
  const price = numberValue(plan.minimumAmount);
  const daily = numberValue(plan.dailyAmount);
  const day = numberValue(plan.dayAmount);
  const total = numberValue(plan.totalAmount);

  return (
    <div
      className={[
        "group relative overflow-hidden rounded-3xl border",
        "border-white/10 bg-slate-950/80 shadow-2xl",
        "backdrop-blur-xl transition duration-300",
        "hover:-translate-y-1 hover:border-emerald-400/40",
        featured ? "ring-1 ring-emerald-400/30" : "",
      ].join(" ")}
    >
      <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl transition group-hover:bg-emerald-400/20" />

      <div className="relative border-b border-white/10 p-6">
        {featured && (
          <span className="mb-3 inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-300">
            Popular
          </span>
        )}

        <h2 className="text-xl font-bold text-white">
          {plan.name}
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          {plan.description ?? "Investment plan"}
        </p>
      </div>

      <div className="relative p-6">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
          <InvestmentRow
            label="PRICE"
            value={formatRand(price)}
          />

          <InvestmentRow
            label="DAILY"
            value={formatRand(daily)}
          />

          <InvestmentRow
            label="DAY"
            value={formatRand(day)}
          />

          <InvestmentRow
            label="TOTAL"
            value={formatRand(total)}
            highlight
          />

          <InvestmentRow
            label="DURATION"
            value={`${plan.durationDays} DAYS`}
          />
        </div>

        <div className="mt-6">
          <Link
            href={`/dashboard/investments/${plan.id}`}
            className="flex w-full items-center justify-center rounded-2xl bg-emerald-500 px-5 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-emerald-400 active:scale-[0.98]"
          >
            INVEST NOW
          </Link>
        </div>
      </div>
    </div>
  );
}

function InvestmentRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={[
        "flex items-center justify-between border-b border-white/10 px-4 py-3.5 last:border-b-0",
        highlight ? "bg-emerald-400/[0.07]" : "",
      ].join(" ")}
    >
      <span className="text-xs font-semibold tracking-wider text-slate-400">
        {label}
      </span>

      <span
        className={[
          "text-sm font-bold",
          highlight ? "text-emerald-300" : "text-white",
        ].join(" ")}
      >
        {value}
      </span>
    </div>
  );
}