import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import InvestmentPlans from "./investment-plans";

export default async function InvestmentsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <Link
          href="/dashboard"
          className="text-sm text-emerald-400 hover:text-emerald-300"
        >
          ← Back to Dashboard
        </Link>

        <div className="mt-8">
          <p className="text-sm font-medium text-emerald-400">
            Investments
          </p>

          <h1 className="mt-1 text-3xl font-bold sm:text-4xl">
            Investment Plans
          </h1>

          <p className="mt-2 max-w-2xl text-slate-400">
            Choose an available investment plan and invest using your
            available wallet balance.
          </p>
        </div>

        <div className="mt-8">
          <InvestmentPlans />
        </div>
      </div>
    </main>
  );
}
