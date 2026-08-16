"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  planId: string;
  planName: string;
  minimumAmount: number;
  totalAmount: number;
  durationDays: number;
  walletBalance: number;
};

function money(value: number) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 2,
  }).format(value);
}

export default function InvestmentConfirmation({
  planId,
  planName,
  minimumAmount,
  totalAmount,
  durationDays,
  walletBalance,
}: Props) {
  const router = useRouter();

  const [amount, setAmount] = useState(minimumAmount.toString());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const numericAmount = Number(amount);

  const canInvest =
    Number.isFinite(numericAmount) &&
    numericAmount >= minimumAmount &&
    numericAmount <= walletBalance;

  async function handleInvest() {
    setError("");
    setSuccess("");

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError("Please enter a valid investment amount.");
      return;
    }

    if (numericAmount < minimumAmount) {
      setError(
        `The minimum investment for this plan is ${money(minimumAmount)}.`,
      );
      return;
    }

    if (numericAmount > walletBalance) {
      setError("You do not have enough funds in your wallet.");
      return;
    }

    const confirmed = window.confirm(
      `Confirm investment of ${money(numericAmount)} in ${planName}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/investments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId,
          amount: numericAmount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data?.error ?? "Unable to create investment.");
        return;
      }

      setSuccess(
        "Investment created successfully. Your wallet balance has been updated.",
      );

      router.refresh();

      setTimeout(() => {
        router.push("/dashboard/investments");
        router.refresh();
      }, 1200);
    } catch (err) {
      console.error("Investment confirmation error:", err);
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950 p-5">
      <h3 className="text-lg font-semibold">
        Confirm Your Investment
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-400">
        Enter the amount you want to invest and confirm the transaction.
        Your wallet will only be charged after the investment is successfully
        created.
      </p>

      <div className="mt-5">
        <label
          htmlFor="investment-amount"
          className="text-sm font-medium text-slate-300"
        >
          Investment Amount
        </label>

        <div className="relative mt-2">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
            R
          </span>

          <input
            id="investment-amount"
            type="number"
            min={minimumAmount}
            max={walletBalance}
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            disabled={loading}
            className="w-full rounded-xl border border-white/10 bg-slate-900 px-10 py-3 text-white outline-none transition focus:border-emerald-500"
          />
        </div>

        <div className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-slate-500">
          <span>Minimum: {money(minimumAmount)}</span>
          <span>Available: {money(walletBalance)}</span>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-slate-900 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Investment
          </p>

          <p className="mt-1 font-semibold">
            {Number.isFinite(numericAmount)
              ? money(numericAmount)
              : money(minimumAmount)}
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-slate-900 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Duration
          </p>

          <p className="mt-1 font-semibold">
            {durationDays} days
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-slate-900 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Plan Total Return
          </p>

          <p className="mt-1 font-semibold text-emerald-400">
            {money(totalAmount)}
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <p className="font-medium text-red-400">{error}</p>
        </div>
      )}

      {success && (
        <div className="mt-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
          <p className="font-medium text-emerald-400">{success}</p>
        </div>
      )}

      <button
        type="button"
        onClick={handleInvest}
        disabled={loading || !canInvest}
        className="mt-6 w-full rounded-xl bg-emerald-500 px-6 py-3.5 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Processing Investment..." : "Confirm Investment"}
      </button>

      <p className="mt-3 text-center text-xs text-slate-500">
        By confirming, you authorize the investment amount to be deducted
        from your available wallet balance.
      </p>
    </div>
  );
}
