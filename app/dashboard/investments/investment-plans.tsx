"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Plan = {
  id: string;
  name: string;
  description: string | null;
  minimumAmount: string | number;
  durationDays: number;
  returnRate: string | number;
};

export default function InvestmentPlans() {
  const router = useRouter();

  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [investing, setInvesting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadPlans() {
      try {
        const response = await fetch("/api/investments");

        const data = await response.json();

        if (!response.ok) {
          setError(data.error ?? "Unable to load investment plans.");
          return;
        }

        setPlans(data.plans);
      } catch {
        setError("Unable to connect to the server.");
      } finally {
        setLoading(false);
      }
    }

    loadPlans();
  }, []);

  function selectPlan(plan: Plan) {
    setSelectedPlan(plan);
    setAmount(String(Number(plan.minimumAmount)));
    setError("");
    setSuccess("");
  }

  async function invest() {
    if (!selectedPlan) return;

    setInvesting(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/investments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId: selectedPlan.id,
          amount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Unable to create investment.");
        return;
      }

      setSuccess(
        "Investment created successfully. Your wallet balance has been updated.",
      );

      setSelectedPlan(null);
      setAmount("");

      router.refresh();
    } catch {
      setError("Unable to connect to the server.");
    } finally {
      setInvesting(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-slate-900 p-8 text-center text-slate-400">
        Loading investment plans...
      </div>
    );
  }

  if (error && plans.length === 0) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-red-300">
        {error}
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="rounded-3xl border border-white/10 bg-slate-900 p-10 text-center">
        <div className="text-5xl">📊</div>

        <h2 className="mt-4 text-xl font-bold">
          No investment plans available
        </h2>

        <p className="mt-2 text-slate-500">
          Investment plans will appear here when they are activated.
        </p>
      </div>
    );
  }

  return (
    <>
      {success && (
        <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-300">
          {success}
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-300">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => {
          const minimum = Number(plan.minimumAmount);
          const rate = Number(plan.returnRate);

          return (
            <div
              key={plan.id}
              className="rounded-3xl border border-white/10 bg-slate-900 p-6 transition hover:-translate-y-1 hover:border-emerald-400/30"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold">
                    {plan.name}
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {plan.description ?? "Investment opportunity"}
                  </p>
                </div>

                <div className="rounded-xl bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-400">
                  {rate}%
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white/5 p-4">
                  <p className="text-xs text-slate-500">
                    Minimum
                  </p>
                  <p className="mt-1 font-semibold">
                    R{minimum.toLocaleString("en-ZA", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>

                <div className="rounded-xl bg-white/5 p-4">
                  <p className="text-xs text-slate-500">
                    Duration
                  </p>
                  <p className="mt-1 font-semibold">
                    {plan.durationDays} days
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => selectPlan(plan)}
                className="mt-6 w-full rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400"
              >
                Invest Now
              </button>
            </div>
          );
        })}
      </div>

      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-emerald-400">
                  New Investment
                </p>

                <h2 className="mt-1 text-2xl font-bold">
                  {selectedPlan.name}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPlan(null)}
                className="text-2xl text-slate-500 hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="mt-6">
              <label
                htmlFor="investmentAmount"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Investment Amount
              </label>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                  R
                </span>

                <input
                  id="investmentAmount"
                  type="number"
                  min={Number(selectedPlan.minimumAmount)}
                  step="0.01"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 py-3 pl-9 pr-4 text-white outline-none focus:border-emerald-400"
                />
              </div>

              <p className="mt-2 text-xs text-slate-500">
                Minimum: R
                {Number(selectedPlan.minimumAmount).toLocaleString(
                  "en-ZA",
                  { minimumFractionDigits: 2 },
                )}
              </p>
            </div>

            <div className="mt-6 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4">
              <p className="text-sm leading-6 text-amber-300">
                Only invest funds you understand and can afford to commit.
                Your available wallet balance will be checked before the
                investment is created.
              </p>
            </div>

            <button
              type="button"
              disabled={investing}
              onClick={invest}
              className="mt-6 w-full rounded-xl bg-emerald-500 px-5 py-3.5 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {investing ? "Creating Investment..." : "Confirm Investment"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
