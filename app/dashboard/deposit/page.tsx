import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import DepositForm from "./deposit-form";

export default async function DepositPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="text-sm text-emerald-400 hover:text-emerald-300"
          >
            ← Back to Dashboard
          </Link>

          <p className="mt-6 text-sm font-medium text-emerald-400">
            Wallet
          </p>

          <h1 className="mt-1 text-3xl font-bold">
            Deposit Funds
          </h1>

          <p className="mt-2 text-slate-400">
            Fund your Icetropez.Vest wallet using the company payment
            details below.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border border-white/10 bg-slate-900 p-6">
            <h2 className="text-xl font-bold">
              Payment Instructions
            </h2>

            <div className="mt-6 space-y-4">
              <div className="rounded-2xl bg-white/5 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Bank
                </p>
                <p className="mt-1 font-semibold">
                  Add company bank details
                </p>
              </div>

              <div className="rounded-2xl bg-white/5 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Account Number
                </p>
                <p className="mt-1 font-semibold">
                  Add account number
                </p>
              </div>

              <div className="rounded-2xl bg-white/5 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Branch Code
                </p>
                <p className="mt-1 font-semibold">
                  Add branch code
                </p>
              </div>

              <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4">
                <p className="text-sm leading-6 text-amber-300">
                  After making your payment, enter the exact payment
                  reference below. Your deposit will remain pending until
                  it is reviewed.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-slate-900 p-6">
            <h2 className="text-xl font-bold">
              Submit Deposit
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Minimum deposit: R100.00
            </p>

            <div className="mt-6">
              <DepositForm />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
