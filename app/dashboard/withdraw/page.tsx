import WithdrawalForm from "./withdrawal-form";

export default function WithdrawalPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <p className="text-sm font-medium text-emerald-400">
            ICETROPEZ.VEST
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Withdraw Funds
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Request a withdrawal from your available investment
            balance. Withdrawals are reviewed and processed manually
            by an administrator.
          </p>
        </div>

        <WithdrawalForm />
      </div>
    </main>
  );
}
