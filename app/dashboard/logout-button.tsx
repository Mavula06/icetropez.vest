"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      router.push("/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={logout}
      disabled={loading}
      className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:border-red-500/30 hover:text-red-400 disabled:opacity-50"
    >
      {loading ? "..." : "Logout"}
    </button>
  );
}
