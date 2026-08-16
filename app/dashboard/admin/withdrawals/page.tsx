"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Withdrawal = {
  id: string;
  userId: string;
  amount: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  branchCode: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
  };
};

function money(value: string | number) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 2,
  }).format(Number(value));
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-ZA", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadWithdrawals() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/withdrawals", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load withdrawals.");
      }

      setWithdrawals(data.withdrawals ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load withdrawals.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWithdrawals();
  }, []);

  async function processWithdrawal(
    withdrawalId: string,
    action: "APPROVE" | "REJECT",
  ) {
    const withdrawal = withdrawals.find(
      (item) => item.id === withdrawalId,
    );

    if (!withdrawal) return;

    const actionText =
      action === "APPROVE" ? "approve" : "reject";

    const confirmed = window.confirm(
      `Are you sure you want to ${actionText} this withdrawal of ${money(
        withdrawal.amount,
      )}?`,
    );

    if (!confirmed) return;

    try {
      setProcessingId(withdrawalId);
      setError("");
      setSuccess("");

      const response = await fetch(
        `/api/admin/withdrawals/${withdrawalId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to process withdrawal.",
        );
      }

      setSuccess(
        action === "APPROVE"
          ? "Withdrawal approved successfully."
          : "Withdrawal rejected and funds returned to the investor.",
      );

      await loadWithdrawals();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to process withdrawal.",
      );
    } finally {
      setProcessingId(null);
    }
  }

  const pendingWithdrawals = withdrawals.filter(
    (withdrawal) => withdrawal.status === "PENDING",
  );

  const processedWithdrawals = withdrawals.filter(
    (withdrawal) => withdrawal.status !== "PENDING",
  );

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Link
              href="/dashboard"
              className="text-sm text-emerald-400 hover:text-emerald-300"
            >
               Dashboard
            </Link>

            <h1 className="mt-3 text-4xl font-bold">
              Withdrawal Management
            </h1>

            <p className="mt-2 text-slate-400">
              Review and process investor withdrawal requests.
            </p>
          </div>

          <button
            onClick={loadWithdrawals}
            disabled={loading}
            className="rounded-xl border border-white/10 bg-slate-900 px-5 py-3 text-sm font-semibold hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-300">
            <p className="font-semibold">Error</p>
            <p className="mt-1 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-300">
            <p className="font-semibold">Success</p>
            <p className="mt-1 text-sm">{success}</p>
          </div>
        )}

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-slate-900 p-6">
            <p className="text-sm text-slate-500">
              Total Requests
            </p>
            <p className="mt-2 text-3xl font-bold">
              {withdrawals.length}
            </p>
          </div>

          <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-6">
            <p className="text-sm text-yellow-300/70">
              Pending
            </p>
            <p className="mt-2 text-3xl font-bold text-yellow-400">
              {pendingWithdrawals.length}
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6">
            <p className="text-sm text-emerald-300/70">
              Processed
            </p>
            <p className="mt-2 text-3xl font-bold text-emerald-400">
              {processedWithdrawals.length}
            </p>
          </div>
        </div>

        <section className="rounded-3xl border border-white/10 bg-slate-900 p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">
              Pending Withdrawals
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              These requests require administrator action.
            </p>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-white/10 bg-slate-950 p-8 text-center text-slate-400">
              Loading withdrawal requests...
            </div>
          ) : pendingWithdrawals.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-slate-950 p-8 text-center">
              <p className="text-lg font-semibold">
                No pending withdrawals
              </p>
              <p className="mt-2 text-sm text-slate-500">
                New withdrawal requests will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {pendingWithdrawals.map((withdrawal) => (
                <div
                  key={withdrawal.id}
                  className="rounded-2xl border border-white/10 bg-slate-950 p-6"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-xl font-bold">
                          {money(withdrawal.amount)}
                        </h3>

                        <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-semibold text-yellow-400">
                          {withdrawal.status}
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-slate-500">
                        Requested {formatDate(withdrawal.createdAt)}
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() =>
                          processWithdrawal(
                            withdrawal.id,
                            "REJECT",
                          )
                        }
                        disabled={
                          processingId === withdrawal.id
                        }
                        className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm font-semibold text-red-400 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {processingId === withdrawal.id
                          ? "Processing..."
                          : "Reject"}
                      </button>

                      <button
                        onClick={() =>
                          processWithdrawal(
                            withdrawal.id,
                            "APPROVE",
                          )
                        }
                        disabled={
                          processingId === withdrawal.id
                        }
                        className="rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {processingId === withdrawal.id
                          ? "Processing..."
                          : "Approve"}
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border border-white/10 bg-slate-900 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Investor
                      </p>

                      <p className="mt-2 font-semibold">
                        {withdrawal.user.firstName ||
                        withdrawal.user.lastName
                          ? `${withdrawal.user.firstName ?? ""} ${
                              withdrawal.user.lastName ?? ""
                            }`.trim()
                          : "Investor"}
                      </p>

                      <p className="mt-1 break-all text-sm text-slate-500">
                        {withdrawal.user.email}
                      </p>

                      {withdrawal.user.phone && (
                        <p className="mt-1 text-sm text-slate-500">
                          {withdrawal.user.phone}
                        </p>
                      )}
                    </div>

                    <div className="rounded-xl border border-white/10 bg-slate-900 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Bank
                      </p>

                      <p className="mt-2 font-semibold">
                        {withdrawal.bankName}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Branch: {withdrawal.branchCode}
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-slate-900 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Account Holder
                      </p>

                      <p className="mt-2 font-semibold">
                        {withdrawal.accountName}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Account: {withdrawal.accountNumber}
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-slate-900 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Withdrawal
                      </p>

                      <p className="mt-2 text-xl font-bold text-emerald-400">
                        {money(withdrawal.amount)}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        ID: {withdrawal.id}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mt-8 rounded-3xl border border-white/10 bg-slate-900 p-6">
          <h2 className="text-2xl font-bold">
            Withdrawal History
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Previously processed withdrawal requests.
          </p>

          <div className="mt-5 space-y-3">
            {processedWithdrawals.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-slate-950 p-5 text-center text-sm text-slate-500">
                No processed withdrawals yet.
              </div>
            ) : (
              processedWithdrawals.map((withdrawal) => (
                <div
                  key={withdrawal.id}
                  className="flex flex-col gap-3 rounded-xl border border-white/10 bg-slate-950 p-5 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-semibold">
                      {money(withdrawal.amount)}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {withdrawal.user.email}
                    </p>

                    <p className="mt-1 text-xs text-slate-600">
                      {formatDate(withdrawal.updatedAt)}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      withdrawal.status === "COMPLETED"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    {withdrawal.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
