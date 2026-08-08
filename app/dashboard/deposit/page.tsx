"use client";

import { FormEvent, useEffect, useState } from "react";

type BankDetails = {
  companyName: string;
  bankName: string;
  accountNumber: string;
  branchCode: string;
  accountType: string;
  supportEmail: string | null;
  supportPhone: string | null;
};

export default function DepositPage() {
  const [bank, setBank] = useState<BankDetails | null>(null);
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");

  const [loadingBank, setLoadingBank] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadBankDetails() {
      try {
        const response = await fetch("/api/bank-details");

        const data = await response.json();

        if (!response.ok) {
          setError(
            data.error ?? "Unable to load banking details.",
          );
          return;
        }

        setBank(data.bank);
      } catch {
        setError("Unable to connect to the server.");
      } finally {
        setLoadingBank(false);
      }
    }

    loadBankDetails();
  }, []);

  async function submitDeposit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError("Please enter a valid deposit amount.");
      return;
    }

    if (numericAmount < 100) {
      setError("Minimum deposit amount is R100.00.");
      return;
    }

    if (!reference.trim()) {
      setError("Please enter your payment reference.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/deposits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: numericAmount,
          reference: reference.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Unable to submit deposit.");
        return;
      }

      setSuccess(
        "Deposit submitted successfully. Your payment will be reviewed by an administrator before your wallet is credited.",
      );

      setAmount("");
      setReference("");
    } catch {
      setError("Unable to connect to the server.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-8">
        <p className="text-sm font-semibold text-emerald-400">
          Wallet Deposit
        </p>

        <h1 className="mt-2 text-3xl font-bold text-white">
          Deposit Funds
        </h1>

        <p className="mt-3 text-slate-400">
          Make an EFT payment to the company bank account below,
          then submit your payment details for verification.
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

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-white/10 bg-slate-900 p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white">
              Company Banking Details
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Use these details when making your EFT payment.
            </p>
          </div>

          {loadingBank ? (
            <div className="py-10 text-center text-slate-400">
              Loading banking details...
            </div>
          ) : bank ? (
            <div className="space-y-4">
              <BankRow
                label="Account Holder"
                value={bank.companyName}
              />

              <BankRow
                label="Bank"
                value={bank.bankName}
              />

              <BankRow
                label="Account Number"
                value={bank.accountNumber}
              />

              <BankRow
                label="Branch Code"
                value={bank.branchCode}
              />

              <BankRow
                label="Account Type"
                value={bank.accountType}
              />

              {bank.supportEmail && (
                <BankRow
                  label="Support Email"
                  value={bank.supportEmail}
                />
              )}

              {bank.supportPhone && (
                <BankRow
                  label="Support Phone"
                  value={bank.supportPhone}
                />
              )}
            </div>
          ) : (
            <div className="rounded-2xl bg-white/5 p-5 text-slate-400">
              Banking details are currently unavailable.
            </div>
          )}

          <div className="mt-6 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4">
            <p className="text-sm leading-6 text-amber-300">
              Make sure the payment reference you submit matches
              your EFT payment reference. Deposits are manually
              verified before funds are added to your wallet.
            </p>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-slate-900 p-6">
          <h2 className="text-xl font-bold text-white">
            Submit Payment
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Enter the details of the EFT payment you made.
          </p>

          <form
            onSubmit={submitDeposit}
            className="mt-6 space-y-5"
          >
            <div>
              <label
                htmlFor="amount"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Deposit Amount
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
                Minimum deposit: R100.00
              </p>
            </div>

            <div>
              <label
                htmlFor="reference"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Payment Reference
              </label>

              <input
                id="reference"
                type="text"
                value={reference}
                onChange={(event) =>
                  setReference(event.target.value)
                }
                placeholder="Your EFT reference"
                maxLength={100}
                className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !bank}
              className="w-full rounded-xl bg-emerald-500 px-5 py-3.5 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting
                ? "Submitting..."
                : "Submit Deposit"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

function BankRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-white/5 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-1 break-all font-semibold text-white">
        {value}
      </p>
    </div>
  );
}
