"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type InvestmentPlan = {
  id: string;
  name: string;
  description?: string | null;
  minimumAmount: string | number;
  durationDays: number;
};

type DisplayPlan = {
  name: string;
  price: number;
  daily: number;
  day: number;
  total: number;
  durationDays: number;
  description: string;
  id?: string;
};

const PLANS: DisplayPlan[] = [
  {
    name: "ICETROPEZ PLAN-A",
    price: 180,
    daily: 30,
    day: 150,
    total: 4500,
    durationDays: 25,
    description: "Starter investment plan",
  },
  {
    name: "ICETROPEZ PLAN-B",
    price: 580,
    daily: 100,
    day: 150,
    total: 15000,
    durationDays: 25,
    description: "Growth investment plan",
  },
  {
    name: "ICETROPEZ PLAN-C",
    price: 1800,
    daily: 410,
    day: 150,
    total: 61500,
    durationDays: 25,
    description: "Advanced investment plan",
  },
  {
    name: "ICETROPEZ PLAN-D",
    price: 4400,
    daily: 1100,
    day: 150,
    total: 16500,
    durationDays: 25,
    description: "Premium investment plan",
  },
  {
    name: "ICETROPEZ PLAN-E",
    price: 98000,
    daily: 2659,
    day: 150,
    total: 397500,
    durationDays: 25,
    description: "Elite investment plan",
  },
];

function formatRand(amount: number) {
  return `R${amount.toLocaleString("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function InvestmentPlans() {
  const [plans, setPlans] = useState<DisplayPlan[]>(PLANS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPlans() {
      try {
        const response = await fetch("/api/investments", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        const databasePlans: InvestmentPlan[] =
          data.plans ?? data.investmentPlans ?? [];

        /*
         * The UI uses the five Icetropez plans above.
         *
         * If database plans exist, attach their IDs so the
         * existing investment detail route continues to work.
         */
        if (databasePlans.length > 0) {
          setPlans(
            PLANS.map((plan, index) => ({
              ...plan,
              id: databasePlans[index]?.id,
            })),
          );
        }
      } catch (error) {
        console.error("Unable to load investment plans:", error);
      } finally {
        setLoading(false);
      }
    }

    loadPlans();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className="h-[390px] animate-pulse rounded-3xl border border-white/10 bg-slate-900/70"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {plans.map((plan, index) => (
        <InvestmentCard
          key={plan.name}
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
  plan: DisplayPlan;
  featured?: boolean;
}) {
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
      {/* Decorative glow */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl transition group-hover:bg-emerald-400/20" />

      {/* Header */}
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
          {plan.description}
        </p>
      </div>

      {/* Investment table */}
      <div className="relative p-6">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
          <InvestmentRow
            label="PRICE"
            value={formatRand(plan.price)}
          />

          <InvestmentRow
            label="DAILY"
            value={formatRand(plan.daily)}
          />

          <InvestmentRow
            label="DAY"
            value={formatRand(plan.day)}
          />

          <InvestmentRow
            label="TOTAL"
            value={formatRand(plan.total)}
            highlight
          />

          <InvestmentRow
            label="DURATION"
            value={`${plan.durationDays} DAYS`}
          />
        </div>

        {/* Invest button */}
        <div className="mt-6">
          {plan.id ? (
            <Link
              href={`/dashboard/investments/${plan.id}`}
              className="flex w-full items-center justify-center rounded-2xl bg-emerald-500 px-5 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-emerald-400 active:scale-[0.98]"
            >
              INVEST NOW
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="flex w-full cursor-not-allowed items-center justify-center rounded-2xl bg-slate-700 px-5 py-3.5 text-sm font-bold text-slate-400"
            >
              INVEST NOW
            </button>
          )}
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
