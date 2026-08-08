"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function RegisterPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    referralCode: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(field: string, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone || undefined,
          password: form.password,
          referralCode: form.referralCode || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to create your account.");
        return;
      }

      setSuccess(
        `Account created successfully! Your referral code is ${data.user.referralCode}.`,
      );

      setForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        referralCode: "",
      });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            Icetropez<span className="text-emerald-400">.Vest</span>
          </Link>

          <Link
            href="/"
            className="text-sm text-slate-400 hover:text-white"
          >
            ← Back to home
          </Link>
        </div>

        <div className="grid overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl lg:grid-cols-2">
          <div className="hidden bg-gradient-to-br from-emerald-500/20 to-slate-950 p-12 lg:block">
            <div className="flex h-full flex-col justify-center">
              <div className="mb-6 text-5xl">📈</div>

              <h1 className="text-4xl font-bold leading-tight">
                Start building your financial future.
              </h1>

              <p className="mt-6 max-w-md leading-7 text-slate-400">
                Create your Icetropez.Vest account and manage your wallet,
                investments, returns and financial activity from one place.
              </p>

              <div className="mt-10 space-y-4 text-sm text-slate-300">
                <p>✓ Personal wallet</p>
                <p>✓ Investment tracking</p>
                <p>✓ Referral rewards</p>
                <p>✓ Secure account management</p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-10">
            <div className="mx-auto max-w-lg">
              <h2 className="text-3xl font-bold">Create your account</h2>

              <p className="mt-2 text-sm text-slate-400">
                Enter your details to get started.
              </p>

              {error && (
                <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              {success && (
                <div className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    label="First name"
                    value={form.firstName}
                    onChange={(value) => updateField("firstName", value)}
                    required
                  />

                  <Field
                    label="Last name"
                    value={form.lastName}
                    onChange={(value) => updateField("lastName", value)}
                    required
                  />
                </div>

                <Field
                  label="Email address"
                  type="email"
                  value={form.email}
                  onChange={(value) => updateField("email", value)}
                  required
                />

                <Field
                  label="Phone number"
                  value={form.phone}
                  onChange={(value) => updateField("phone", value)}
                  placeholder="Optional"
                />

                <Field
                  label="Password"
                  type="password"
                  value={form.password}
                  onChange={(value) => updateField("password", value)}
                  placeholder="At least 8 characters"
                  required
                />

                <Field
                  label="Confirm password"
                  type="password"
                  value={form.confirmPassword}
                  onChange={(value) =>
                    updateField("confirmPassword", value)
                  }
                  required
                />

                <Field
                  label="Referral code"
                  value={form.referralCode}
                  onChange={(value) => updateField("referralCode", value)}
                  placeholder="Optional"
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-emerald-500 px-5 py-3.5 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Creating account..." : "Create Account"}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-400">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-emerald-400 hover:text-emerald-300"
                >
                  Sign in
                </Link>
              </p>

              <p className="mt-8 text-center text-xs leading-5 text-slate-500">
                By creating an account, you agree to use the platform
                responsibly. Investment returns are not guaranteed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-300">
        {label}
      </span>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-400"
      />
    </label>
  );
}
