"use client";

import { useEffect, useState } from "react";

type Deposit = {
  id: string;
  amount: string | number;
  reference: string | null;
  status: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
};

export default function AdminDepositsPage() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadDeposits() {
    try {
      setError("");

      const response = await fetch("/api/admin/deposits");

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ?? "Unable to load deposits.",
        );
        return;
      }

      setDeposits(data.deposits);
    } catch {
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDeposits();
  }, []);

  async function processDeposit(
    depositId: string,
    action: "APPROVE" | "REJECT",
  ) {
    const message =
      action === "APPROVE"
        ? "Approve this deposit and credit the user's wallet?"
        : "Reject this deposit?";

    if (!window.confirm(message)) {
      return;
    }

    setProcessing(depositId);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `/api/admin/deposits/${depositId}`,
        {
          method: "PATCH",
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
        setError(
          data.error ?? "Unable to process deposit.",
        );
        return;
      }

      setSuccess(data.message);

      setDeposits((current) =>
        current.filter(
          (deposit) => deposit.id !== depositId,
        ),
      );
    } catch {
      setError("Unable to connect to the server.");
    } finally {
      setProcessing("");
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-10">
        <p className="text-slate-400">
          Loading pending deposits...
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8">
        <p className="text-sm font-semibold text-emerald-400">
          Administration
        </p>

        <h1 className="mt-2 text-3xl font-bold text-white">
          Deposit Approvals
        </h1>

        <p className="mt-3 text-slate-400">
          Verify EFT payments before crediting user wallets.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-300">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-300">
          {success}
        </div>
      )}

      {deposits.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-slate-900 p-10 text-center">
          <div className="text-4xl">✓</div>

          <h2 className="mt-4 text-xl font-bold text-white">
            No pending deposits
          </h2>

          <p className="mt-2 text-slate-500">
            All submitted deposits have been processed.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {deposits.map((deposit) => (
            <div
              key={deposit.id}
              className="rounded-3xl border border-white/10 bg-slate-900 p-6"
            >
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-2xl font-bold text-white">
                    R
                    {Number(deposit.amount).toLocaleString(
                      "en-ZA",
                      {
                        minimumFractionDigits: 2,
                      },
                    )}
                  </p>

                  <p className="mt-2 font-medium text-slate-300">
                    {deposit.user.firstName}{" "}
                    {deposit.user.lastName}
                  </p>

                  <p className="text-sm text-slate-500">
                    {deposit.user.email}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl bg-white/5 p-4">
                    <p className="text-xs text-slate-500">
                      Reference
                    </p>

                    <p className="mt-1 font-medium text-white">
                      {deposit.reference ?? "—"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-white/5 p-4">
                    <p className="text-xs text-slate-500">
                      Submitted
                    </p>

                    <p className="mt-1 font-medium text-white">
                      {new Date(
                        deposit.createdAt,
                      ).toLocaleString("en-ZA")}
                    </p>
                  </div>

                  <div className="rounded-xl bg-amber-400/10 p-4">
                    <p className="text-xs text-amber-400">
                      Status
                    </p>

                    <p className="mt-1 font-medium text-amber-300">
                      PENDING
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    disabled={processing === deposit.id}
                    onClick={() =>
                      processDeposit(
                        deposit.id,
                        "REJECT",
                      )
                    }
                    className="rounded-xl border border-red-500/30 px-5 py-3 font-semibold text-red-300 transition hover:bg-red-500/10 disabled:opacity-50"
                  >
                    Reject
                  </button>

                  <button
                    type="button"
                    disabled={processing === deposit.id}
                    onClick={() =>
                      processDeposit(
                        deposit.id,
                        "APPROVE",
                      )
                    }
                    className="rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
                  >
                    {processing === deposit.id
                      ? "Processing..."
                      : "Approve"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
