'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type UsernameCardProps = {
  canChange: boolean;
  initialUsername: string;
};

const USERNAME_PATTERN = /^[a-zA-Z0-9_]+$/;

export default function UsernameCard({
  canChange,
  initialUsername,
}: UsernameCardProps) {
  const [username, setUsername] = useState(initialUsername);
  const [locked, setLocked] = useState(!canChange);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedUsername = username.trim();

    setMessage(null);
    setError(null);

    if (locked) {
      setError('This username change has already been used. It can only be changed once.');
      return;
    }

    if (trimmedUsername.length < 3) {
      setError('Username must be at least 3 characters long.');
      return;
    }

    if (trimmedUsername.length > 24) {
      setError('Username must be 24 characters or less.');
      return;
    }

    if (!USERNAME_PATTERN.test(trimmedUsername)) {
      setError('Use only letters, numbers, and underscores in the username.');
      return;
    }

    setSaving(true);

    const { error } = await supabase.auth.updateUser({
      data: {
        username: trimmedUsername,
        display_name: trimmedUsername,
        username_change_used: true,
      },
    });

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.id) {
        await supabase
          .from('profiles')
          .update({
            username: trimmedUsername,
            username_change_used: true,
          })
          .eq('id', user.id);
      }
    }

    if (error) {
      setError(error.message);
    } else {
      setUsername(trimmedUsername);
      setLocked(true);
      setMessage('Username saved. This change is now locked because it can only be done once.');
    }

    setSaving(false);
  };

  return (
    <div className="rounded-[32px] border border-white/70 bg-[linear-gradient(180deg,_rgba(255,255,255,0.95)_0%,_rgba(241,250,249,0.92)_100%)] p-7 shadow-[0_28px_80px_rgba(14,116,144,0.08)] backdrop-blur">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-700">
        Profile
      </p>
      <h2 className="mt-3 text-2xl font-semibold text-slate-900">
        Choose how the app should address you
      </h2>
      <p className="mt-3 text-sm leading-7 text-slate-600">
        Add a username so the experience feels more personal and does not rely
        on your email address.
      </p>
      <p className="mt-3 rounded-2xl bg-amber-50 px-4 py-3 text-sm leading-7 text-amber-900">
        You can change your username here only once. After you save it, the
        username edit will be locked.
      </p>

      <form onSubmit={handleSave} className="mt-6">
        <label className="block text-sm font-semibold text-slate-700">
          Preferred username
        </label>
        <input
          type="text"
          required
          minLength={3}
          maxLength={24}
          placeholder="e.g. afya_star"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          disabled={locked}
          className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
        />

        <p className="mt-3 text-xs leading-6 text-slate-500">
          Letters, numbers, and underscores only. This can be changed later.
        </p>

        {error && (
          <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {message && (
          <p className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={saving || locked}
          className="mt-5 rounded-full bg-teal-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {locked ? 'Username locked' : saving ? 'Saving...' : 'Save username'}
        </button>
      </form>
    </div>
  );
}
