"use client";

import { useEffect, useState } from "react";

type Wallet = {
  balance: string;
  availableBalance: string;
};

type Withdrawal = {
  id: string;
  amount: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  branchCode: string;
  status: string;
  createdAt: string;
};

export default function WithdrawalForm() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);

  const [amount, setAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [branchCode, setBranchCode] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadWithdrawals() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/withdrawals", {
  method: "GET",
  cache: "no-store",
  credentials: "include",
});

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ?? "Unable to load withdrawal information.",
        );
        return;
      }

      setWallet(data.wallet);
      setWithdrawals(data.withdrawals ?? []);
    } catch (error) {
      console.error("Withdrawal loading error:", error);
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWithdrawals();
  }, []);

  async function submitWithdrawal(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const numericAmount = Number(amount);
    const available = Number(wallet?.availableBalance ?? 0);

    if (!numericAmount || numericAmount <= 0) {
      setError("Please enter a valid withdrawal amount.");
      return;
    }

    if (numericAmount < 100) {
      setError("Minimum withdrawal amount is R100.00.");
      return;
    }

    if (numericAmount > available) {
      setError(
        "The withdrawal amount cannot exceed your available balance.",
      );
      return;
    }

    if (!bankName.trim()) {
      setError("Please enter your bank name.");
      return;
    }

    if (!accountName.trim()) {
      setError("Please enter the account holder name.");
      return;
    }

    if (!accountNumber.trim()) {
      setError("Please enter your account number.");
      return;
    }

    if (!branchCode.trim()) {
      setError("Please enter your branch code.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch("/api/withdrawals", {
  method: "POST",
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
  },
        body: JSON.stringify({
          amount: numericAmount,
          bankName: bankName.trim(),
          accountName: accountName.trim(),
          accountNumber: accountNumber.trim(),
          branchCode: branchCode.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ?? "Unable to submit withdrawal request.",
        );
        return;
      }

      setSuccess(
        "Withdrawal request submitted successfully. An administrator will review your request.",
      );

      setAmount("");
      setBankName("");
      setAccountName("");
      setAccountNumber("");
      setBranchCode("");

      await loadWithdrawals();
    } catch (error) {
      console.error("Withdrawal submission error:", error);
      setError("Unable to connect to the server.");
    } finally {
      setSubmitting(false);
    }
  }

  function formatDate(value: string) {
    return new Date(value).toLocaleString("en-ZA");
  }

  function statusClass(status: string) {
    switch (status) {
      case "COMPLETED":
        return "text-emerald-400";

      case "FAILED":
        return "text-red-400";

      case "CANCELLED":
        return "text-red-400";

      default:
        return "text-amber-400";
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300">
          {success}
        </div>
      )}

      {loading ? (
        <div className="rounded-3xl border border-white/10 bg-slate-900 p-6 text-sm text-slate-400">
          Loading your withdrawal information...
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-slate-900 p-6">
              <p className="text-sm text-slate-500">
                Total Balance
              </p>

              <p className="mt-2 text-2xl font-bold text-white">
                R{wallet?.balance ?? "0.00"}
              </p>
            </div>

            <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-6">
              <p className="text-sm text-slate-500">
                Available to Withdraw
              </p>

              <p className="mt-2 text-2xl font-bold text-emerald-400">
                R{wallet?.availableBalance ?? "0.00"}
              </p>
            </div>
          </div>

          <form
            onSubmit={submitWithdrawal}
            className="rounded-3xl border border-white/10 bg-slate-900 p-6"
          >
            <h2 className="text-xl font-bold text-white">
              Request Withdrawal
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Enter the amount you want to withdraw and the bank
              account where you want the funds sent.
            </p>

            <div className="mt-6 space-y-5">
              <div>
                <label
                  htmlFor="amount"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Withdrawal Amount
                </label>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                    R
                  </span>

                  <input
                    id="amount"
                    type="number"
                    min="100"
                    step="0.01"
                    value={amount}
                    onChange={(event) =>
                      setAmount(event.target.value)
                    }
                    placeholder="100.00"
                    className="w-full rounded-xl border border-white/10 bg-slate-950 py-3 pl-9 pr-4 text-white outline-none focus:border-emerald-400"
                    required
                  />
                </div>

                <p className="mt-2 text-xs text-slate-500">
                  Minimum withdrawal: R100.00
                </p>
              </div>

              <div>
                <label
                  htmlFor="bankName"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Bank Name
                </label>

                <input
                  id="bankName"
                  type="text"
                  value={bankName}
                  onChange={(event) =>
                    setBankName(event.target.value)
                  }
                  placeholder="e.g. ABSA"
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="accountName"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Account Holder Name
                </label>

                <input
                  id="accountName"
                  type="text"
                  value={accountName}
                  onChange={(event) =>
                    setAccountName(event.target.value)
                  }
                  placeholder="Name as shown on bank account"
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="accountNumber"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Account Number
                </label>

                <input
                  id="accountNumber"
                  type="text"
                  inputMode="numeric"
                  value={accountNumber}
                  onChange={(event) =>
                    setAccountNumber(event.target.value)
                  }
                  placeholder="Bank account number"
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="branchCode"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Branch Code
                </label>

                <input
                  id="branchCode"
                  type="text"
                  inputMode="numeric"
                  value={branchCode}
                  onChange={(event) =>
                    setBranchCode(event.target.value)
                  }
                  placeholder="Branch code"
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400"
                  required
                />
              </div>

              <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4">
                <p className="text-sm leading-6 text-amber-300">
                  Your requested amount will be reserved while your
                  withdrawal is being reviewed. Do not submit the
                  same withdrawal multiple times.
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-emerald-500 px-5 py-3.5 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting
                  ? "Submitting Request..."
                  : "Request Withdrawal"}
              </button>
            </div>
          </form>

          <div className="rounded-3xl border border-white/10 bg-slate-900 p-6">
            <h2 className="text-xl font-bold text-white">
              Withdrawal History
            </h2>

            {withdrawals.length === 0 ? (
              <p className="mt-5 text-sm text-slate-500">
                You have not submitted any withdrawal requests.
              </p>
            ) : (
              <div className="mt-5 space-y-3">
                {withdrawals.map((withdrawal) => (
                  <div
                    key={withdrawal.id}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold text-white">
                          R{withdrawal.amount}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {withdrawal.bankName} •{" "}
                          {withdrawal.accountNumber}
                        </p>

                        <p className="mt-1 text-xs text-slate-600">
                          {formatDate(withdrawal.createdAt)}
                        </p>
                      </div>

                      <p
                        className={`font-semibold ${statusClass(
                          withdrawal.status,
                        )}`}
                      >
                        {withdrawal.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
