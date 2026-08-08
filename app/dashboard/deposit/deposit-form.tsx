"use client";

import { useEffect, useState } from "react";

type BankDetails = {
  companyName: string;
  bankName: string;
  accountNumber: string;
  branchCode: string;
  accountType: string;
  supportEmail: string | null;
  supportPhone: string | null;
};

export default function DepositForm() {
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
        setLoadingBank(true);
        setError("");

        const response = await fetch("/api/banking-details", {
          method: "GET",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          setError(
            data.error ?? "Unable to load banking details.",
          );
          return;
        }

        setBank(data.bank);
      } catch (error) {
        console.error("Bank details error:", error);
        setError("Unable to connect to the server.");
      } finally {
        setLoadingBank(false);
      }
    }

    loadBankDetails();
  }, []);

  async function submitDeposit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const numericAmount = Number(amount);

    if (!numericAmount || numericAmount < 100) {
      setError("Minimum deposit amount is R100.00.");
      return;
    }

    if (!reference.trim()) {
      setError("Please enter your payment reference.");
      return;
    }

    try {
      setSubmitting(true);

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
        setError(
          data.error ?? "Unable to submit your deposit.",
        );
        return;
      }

      setSuccess(
        "Deposit submitted successfully. Your payment will be reviewed by an administrator.",
      );

      setAmount("");
      setReference("");
    } catch (error) {
      console.error("Deposit submission error:", error);
      setError("Unable to connect to the server.");
    } finally {
      setSubmitting(false);
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

      <div className="rounded-3xl border border-white/10 bg-slate-900 p-6">
        <h2 className="text-xl font-bold text-white">
          Make a Deposit
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-400">
          Transfer funds to the company bank account below, then
          submit your payment details for approval.
        </p>
      </div>

      <div className="rounded-3xl border border-emerald-500/20 bg-slate-900 p-6">
        <h2 className="text-lg font-bold text-white">
          Banking Details
        </h2>

        {loadingBank ? (
          <div className="mt-6 rounded-2xl bg-white/5 p-5 text-sm text-slate-400">
            Loading banking details...
          </div>
        ) : bank ? (
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl bg-white/5 p-4">
              <p className="text-xs text-slate-500">
                Account Holder
              </p>
              <p className="mt-1 font-semibold text-white">
                {bank.companyName}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-white/5 p-4">
                <p className="text-xs text-slate-500">
                  Bank
                </p>
                <p className="mt-1 font-semibold uppercase text-white">
                  {bank.bankName}
                </p>
              </div>

              <div className="rounded-2xl bg-white/5 p-4">
                <p className="text-xs text-slate-500">
                  Account Type
                </p>
                <p className="mt-1 font-semibold text-white">
                  {bank.accountType}
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-white/5 p-4">
              <p className="text-xs text-slate-500">
                Account Number
              </p>
              <p className="mt-1 text-lg font-bold tracking-wide text-emerald-400">
                {bank.accountNumber}
              </p>
            </div>

            <div className="rounded-2xl bg-white/5 p-4">
              <p className="text-xs text-slate-500">
                Branch Code
              </p>
              <p className="mt-1 font-semibold text-white">
                {bank.branchCode}
              </p>
            </div>

            {(bank.supportEmail || bank.supportPhone) && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-slate-500">
                  Payment Support
                </p>

                {bank.supportEmail && (
                  <p className="mt-2 text-sm text-slate-300">
                    Email: {bank.supportEmail}
                  </p>
                )}

                {bank.supportPhone && (
                  <p className="mt-1 text-sm text-slate-300">
                    Phone: {bank.supportPhone}
                  </p>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5 text-sm text-amber-300">
            Banking details are currently unavailable. Please try
            again later.
          </div>
        )}
      </div>

      <form
        onSubmit={submitDeposit}
        className="rounded-3xl border border-white/10 bg-slate-900 p-6"
      >
        <h2 className="text-lg font-bold text-white">
          Submit Payment
        </h2>

        <div className="mt-6 space-y-5">
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
              placeholder="Enter your bank payment reference"
              maxLength={100}
              className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400"
              required
            />

            <p className="mt-2 text-xs text-slate-500">
              Use the reference shown on your bank transfer.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4">
            <p className="text-sm leading-6 text-amber-300">
              After submitting, your deposit will remain pending
              until an administrator verifies the payment.
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-emerald-500 px-5 py-3.5 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting
              ? "Submitting Deposit..."
              : "Submit Deposit"}
          </button>
        </div>
      </form>
    </div>
  );
}
