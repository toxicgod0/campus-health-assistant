"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type GoogleAuthButtonProps = {
  mode: "login" | "signup";
};

export default function GoogleAuthButton({
  mode,
}: GoogleAuthButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError(null);

    const redirectTo = `${window.location.origin}/auth/callback?next=/dashboard`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        scopes: "email profile",
        queryParams: {
          access_type: "offline",
          prompt: "select_account",
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleGoogleAuth}
        disabled={loading}
        className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
      >
        <span className="text-lg" aria-hidden="true">
          G
        </span>
        {loading
          ? "Redirecting to Google..."
          : mode === "login"
            ? "Sign in with Google"
            : "Continue with Google"}
      </button>

      {error && (
        <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}
    </>
  );
}
