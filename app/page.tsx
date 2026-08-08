import Link from "next/link";

const features = [
  {
    icon: "📈",
    title: "Investment Plans",
    text: "Explore investment opportunities and track your portfolio.",
  },
  {
    icon: "💰",
    title: "Digital Wallet",
    text: "Manage your balance, deposits, withdrawals and returns.",
  },
  {
    icon: "🎁",
    title: "Referral Rewards",
    text: "Invite friends and earn rewards through the referral program.",
  },
  {
    icon: "🔐",
    title: "Secure Account",
    text: "Your account and financial activity are protected with secure authentication.",
  },
];

const steps = [
  {
    number: "01",
    title: "Create your account",
    text: "Register with your basic information and create your secure account.",
  },
  {
    number: "02",
    title: "Fund your wallet",
    text: "Deposit funds into your Icetropez.Vest wallet.",
  },
  {
    number: "03",
    title: "Choose an investment",
    text: "Select an available investment plan that suits your goals.",
  },
  {
    number: "04",
    title: "Track your progress",
    text: "Monitor investments, returns, wallet activity and withdrawals.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <nav className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-xl font-bold">
            Icetropez<span className="text-emerald-400">.Vest</span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-slate-300 hover:text-white">
              Features
            </a>
            <a href="#how-it-works" className="text-sm text-slate-300 hover:text-white">
              How It Works
            </a>
            <a href="#about" className="text-sm text-slate-300 hover:text-white">
              About
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm text-slate-200 hover:bg-white/10"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.18),transparent_35%)]" />

        <div className="relative mx-auto grid max-w-7xl gap-16 px-6 py-24 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="mb-6 inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-300">
              Smart investing starts here
            </div>

            <h1 className="text-5xl font-bold leading-tight sm:text-6xl">
              Build your financial future with{" "}
              <span className="text-emerald-400">Icetropez.Vest</span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
              A modern investment platform designed to help you manage your
              wallet, investments, returns and financial activity from one
              secure dashboard.
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/register"
                className="rounded-xl bg-emerald-500 px-7 py-4 text-center font-semibold text-slate-950 hover:bg-emerald-400"
              >
                Create Account
              </Link>

              <Link
                href="/login"
                className="rounded-xl border border-white/15 bg-white/5 px-7 py-4 text-center font-semibold hover:bg-white/10"
              >
                Sign In
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-6 text-sm text-slate-400">
              <span>✓ Secure accounts</span>
              <span>✓ Wallet management</span>
              <span>✓ Investment tracking</span>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl">
            <div className="rounded-2xl bg-slate-900 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Portfolio Balance</p>
                  <p className="mt-2 text-4xl font-bold">R25,480.00</p>
                </div>

                <div className="rounded-xl bg-emerald-400/10 px-3 py-2 text-sm text-emerald-400">
                  +12.4%
                </div>
              </div>

              <div className="mt-8 h-32 rounded-xl bg-gradient-to-t from-emerald-500/20 to-transparent">
                <div className="flex h-full items-end gap-2 px-4 pb-4">
                  {[35, 50, 42, 65, 55, 78, 68, 90, 82, 100].map(
                    (height, index) => (
                      <div
                        key={index}
                        className="flex-1 rounded-t bg-emerald-400/70"
                        style={{ height: `${height}%` }}
                      />
                    ),
                  )}
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-white/5 p-4">
                  <p className="text-xs text-slate-500">Available</p>
                  <p className="mt-1 font-semibold">R8,250.00</p>
                </div>

                <div className="rounded-xl bg-white/5 p-4">
                  <p className="text-xs text-slate-500">Invested</p>
                  <p className="mt-1 font-semibold">R17,230.00</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="border-t border-white/10 bg-slate-900/50">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-400">
            Platform
          </p>

          <h2 className="mt-3 text-4xl font-bold">
            Everything you need in one place
          </h2>

          <p className="mt-4 text-slate-400">
            Manage your financial activity through a simple and intuitive platform.
          </p>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-white/10 bg-slate-950 p-6 hover:border-emerald-400/30"
              >
                <div className="text-4xl">{feature.icon}</div>

                <h3 className="mt-5 text-xl font-semibold">
                  {feature.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-400">
                  {feature.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-emerald-400">
              Simple process
            </p>

            <h2 className="mt-3 text-4xl font-bold">
              How Icetropez.Vest works
            </h2>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div
                key={step.number}
                className="rounded-2xl border border-white/10 bg-white/[0.02] p-6"
              >
                <div className="text-5xl font-bold text-emerald-400/20">
                  {step.number}
                </div>

                <h3 className="mt-3 text-xl font-semibold">
                  {step.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-400">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="border-t border-white/10">
        <div className="mx-auto max-w-5xl px-6 py-24 text-center">
          <h2 className="text-4xl font-bold">Ready to get started?</h2>

          <p className="mx-auto mt-5 max-w-2xl text-slate-400">
            Create your account and access your personal financial dashboard.
          </p>

          <Link
            href="/register"
            className="mt-8 inline-block rounded-xl bg-emerald-500 px-8 py-4 font-semibold text-slate-950 hover:bg-emerald-400"
          >
            Create Your Account
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-8 text-sm text-slate-500">
          © {new Date().getFullYear()} Icetropez.Vest. All rights reserved.
        </div>
      </footer>
    </main>
  );
}
