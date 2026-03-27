'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import GoogleAuthButton from '@/components/GoogleAuthButton';

const USERNAME_PATTERN = /^[a-zA-Z0-9_]+$/;

export default function SignUp() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const trimmedUsername = username.trim();

    if (trimmedUsername.length < 3) {
      setError('Username must be at least 3 characters long.');
      setLoading(false);
      return;
    }

    if (trimmedUsername.length > 24) {
      setError('Username must be 24 characters or less.');
      setLoading(false);
      return;
    }

    if (!USERNAME_PATTERN.test(trimmedUsername)) {
      setError('Use only letters, numbers, and underscores in the username.');
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: trimmedUsername,
          display_name: trimmedUsername,
          username_change_used: false,
        },
      },
    });

    if (error) {
      setError(error.message);
    } else if (data.session) {
      router.push('/dashboard');
    } else {
      setMessage(
        'Account created, but Supabase did not return a session yet. If this account was created while Confirm Email was enabled, confirm it first or recreate it now that confirmations are off.'
      );
    }

    setLoading(false);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.45),_transparent_36%),radial-gradient(circle_at_bottom_right,_rgba(239,68,68,0.38),_transparent_34%),linear-gradient(135deg,_#081225_0%,_#0f172a_48%,_#1f2937_100%)]" />
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:36px_36px]" />

      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-md rounded-[28px] border border-white/20 bg-white/92 p-8 shadow-2xl shadow-rose-950/30 backdrop-blur"
      >
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-rose-600">
          New Account
        </p>
        <h2 className="mt-3 text-3xl font-bold text-slate-900">
          Create your Campus Health Assistant account
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Set up your student health workspace and get access to secure support
          tools in a few steps.
        </p>

        <GoogleAuthButton mode="signup" />

        <div className="mt-6 flex items-center gap-3 text-xs uppercase tracking-[0.24em] text-slate-400">
          <span className="h-px flex-1 bg-slate-200" />
          Or sign up with email
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        {error && (
          <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}
        {message && (
          <p className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {message}
          </p>
        )}

        <label className="mt-6 block text-sm font-semibold text-slate-700">
          Username
        </label>
        <input
          type="text"
          required
          minLength={3}
          maxLength={24}
          placeholder="e.g. afya_star"
          className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-rose-400 focus:bg-white focus:ring-4 focus:ring-rose-100"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <p className="mt-2 text-xs leading-5 text-slate-500">
          Letters, numbers, and underscores only.
        </p>

        <label className="mt-5 block text-sm font-semibold text-slate-700">
          Email address
        </label>
        <input
          type="email"
          required
          placeholder="you@example.com"
          className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-rose-400 focus:bg-white focus:ring-4 focus:ring-rose-100"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label className="mt-5 block text-sm font-semibold text-slate-700">
          Password
        </label>
        <input
          type="password"
          required
          minLength={6}
          className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-rose-400 focus:bg-white focus:ring-4 focus:ring-rose-100"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          disabled={loading}
          className="mt-7 w-full rounded-xl bg-gradient-to-r from-rose-500 via-fuchsia-600 to-blue-600 py-3 font-semibold text-white shadow-lg shadow-rose-500/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? 'Creating...' : 'Sign Up'}
        </button>

        <p className="mt-5 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-rose-600 hover:text-blue-700">
            Log in
          </Link>
        </p>

        <p className="mt-3 text-center text-xs leading-5 text-slate-500">
          Google sign-in skips the password step, while email sign-up depends on
          your current Supabase confirmation settings. Users who join with
          Google can set a username from the dashboard.
        </p>
      </form>
    </div>
  );
}
