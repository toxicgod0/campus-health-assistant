'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.toLowerCase().includes('email not confirmed')) {
        setError(
          'Your account exists, but the email address has not been confirmed yet. Confirm it first, or disable Confirm Email in Supabase while testing.'
        );
      } else {
        setError(error.message);
      }
    } else {
      router.push('/dashboard');
    }

    setLoading(false);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.45),_transparent_36%),radial-gradient(circle_at_bottom_right,_rgba(239,68,68,0.38),_transparent_34%),linear-gradient(135deg,_#081225_0%,_#0f172a_48%,_#1f2937_100%)]" />
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:36px_36px]" />

      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-md rounded-[28px] border border-white/20 bg-white/92 p-8 shadow-2xl shadow-blue-950/30 backdrop-blur"
      >
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-700">
          Welcome Back
        </p>
        <h2 className="mt-3 text-3xl font-bold text-slate-900">
          Log in to Campus Health Assistant
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Access your student health tools, booking support, and personal
          records from one secure dashboard.
        </p>

        {error && (
          <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <label className="mt-6 block text-sm font-semibold text-slate-700">
          University Email
        </label>
        <input
          type="email"
          required
          placeholder="you@maseno.ac.ke"
          className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label className="mt-5 block text-sm font-semibold text-slate-700">
          Password
        </label>
        <input
          type="password"
          required
          className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          disabled={loading}
          className="mt-7 w-full rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-rose-500 py-3 font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? 'Signing in...' : 'Log In'}
        </button>

        <p className="mt-5 text-center text-sm text-slate-600">
          No account yet?{' '}
          <Link href="/signup" className="font-semibold text-blue-700 hover:text-rose-600">
            Sign up
          </Link>
        </p>

        <p className="mt-3 text-center text-xs leading-5 text-slate-500">
          If Supabase email confirmation is enabled, you must confirm the email
          before password login will work.
        </p>
      </form>
    </div>
  );
}
