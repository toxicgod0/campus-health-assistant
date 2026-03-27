'use client';

import AppointmentCountdownBanner from '@/components/AppointmentCountdownBanner';
import { useAuth } from '@/components/SupabaseProvider';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type JournalEntry = {
  created_at: string;
  energy_level: number | null;
  id: string;
  mood: string | null;
  notes: string;
  self_care_plan: string | null;
  symptoms: string | null;
  title: string;
};

function formatJournalDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

export default function HealthJournalPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [mood, setMood] = useState('steady');
  const [energyLevel, setEnergyLevel] = useState(3);
  const [symptoms, setSymptoms] = useState('');
  const [notes, setNotes] = useState('');
  const [selfCarePlan, setSelfCarePlan] = useState('');
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, router, user]);

  useEffect(() => {
    if (!user) return;

    const loadEntries = async () => {
      const { data, error } = await supabase
        .from('health_journal_entries')
        .select('created_at, energy_level, id, mood, notes, self_care_plan, symptoms, title')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        setError(
          error.code === '42P01'
            ? 'Journal storage is not ready yet. Run the new Supabase SQL migration first.'
            : error.message
        );
        return;
      }

      setEntries(data ?? []);
    };

    loadEntries();
  }, [user]);

  if (loading) {
    return <div className="min-h-screen bg-[#eef8f7]" />;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return;

    setSaving(true);
    setError(null);
    setMessage(null);

    const { data, error } = await supabase
      .from('health_journal_entries')
      .insert({
        user_id: user.id,
        title,
        mood,
        energy_level: energyLevel,
        symptoms,
        notes,
        self_care_plan: selfCarePlan,
      })
      .select('created_at, energy_level, id, mood, notes, self_care_plan, symptoms, title')
      .single();

    if (error) {
      setError(
        error.code === '42P01'
          ? 'Journal storage is not ready yet. Run the new Supabase SQL migration first.'
          : error.message
      );
    } else if (data) {
      setEntries((current) => [data, ...current]);
      setTitle('');
      setMood('steady');
      setEnergyLevel(3);
      setSymptoms('');
      setNotes('');
      setSelfCarePlan('');
      setMessage('Journal entry saved.');
    }

    setSaving(false);
  };

  return (
    <main className="min-h-screen bg-[#eef8f7] px-4 py-6 text-slate-800 sm:px-6 lg:px-8">
      <AppointmentCountdownBanner userId={user?.id} />

      <div className="mx-auto max-w-6xl">
        <Link href="/dashboard" className="text-sm font-semibold text-teal-700 hover:text-teal-900">
          Back to dashboard
        </Link>

        <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <section className="rounded-[30px] border border-white/80 bg-white/90 p-7 shadow-[0_24px_70px_rgba(15,118,110,0.08)]">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-700">
              Private Health Journal
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">
              Capture how you are feeling, what helped, and what to watch next
            </h1>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              This journal gives you a private place to reflect on symptoms,
              energy, mood, and self-care plans over time.
            </p>

            {message && (
              <p className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {message}
              </p>
            )}

            {error && (
              <p className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700">
                  Entry title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="e.g. End of week health check-in"
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-100"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-700">
                    Mood
                  </label>
                  <select
                    value={mood}
                    onChange={(event) => setMood(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-100"
                  >
                    <option value="steady">Steady</option>
                    <option value="stressed">Stressed</option>
                    <option value="tired">Tired</option>
                    <option value="hopeful">Hopeful</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700">
                    Energy level: {energyLevel}/5
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={energyLevel}
                    onChange={(event) => setEnergyLevel(Number(event.target.value))}
                    className="mt-4 w-full accent-teal-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700">
                  Symptoms or physical changes
                </label>
                <textarea
                  rows={3}
                  value={symptoms}
                  onChange={(event) => setSymptoms(event.target.value)}
                  placeholder="What symptoms did you notice today?"
                  className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-4 text-slate-900 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-100"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700">
                  Journal notes
                </label>
                <textarea
                  rows={5}
                  required
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="How did today feel? What stood out? What improved or worsened?"
                  className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-4 text-slate-900 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-100"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700">
                  Self-care plan
                </label>
                <textarea
                  rows={3}
                  value={selfCarePlan}
                  onChange={(event) => setSelfCarePlan(event.target.value)}
                  placeholder="What do you want to do next for your wellbeing?"
                  className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-4 text-slate-900 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-100"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-teal-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? 'Saving...' : 'Save journal entry'}
              </button>
            </form>
          </section>

          <aside className="rounded-[30px] border border-white/80 bg-[linear-gradient(180deg,_rgba(240,253,250,0.95)_0%,_rgba(255,255,255,0.94)_100%)] p-7 shadow-[0_24px_70px_rgba(14,116,144,0.08)]">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-700">
              Journal History
            </p>

            <div className="mt-5 space-y-4">
              {entries.length === 0 && !error ? (
                <div className="rounded-2xl bg-white p-5 text-sm leading-7 text-slate-600 shadow-sm">
                  Your private entries will appear here once you save them.
                </div>
              ) : null}

              {entries.map((entry) => (
                <article key={entry.id} className="rounded-2xl bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {formatJournalDate(entry.created_at)}
                  </p>
                  <h2 className="mt-2 text-lg font-semibold text-slate-900">
                    {entry.title}
                  </h2>
                  <p className="mt-2 text-sm text-slate-600">
                    Mood: {entry.mood} | Energy: {entry.energy_level}/5
                  </p>
                  {entry.symptoms && (
                    <p className="mt-3 text-sm leading-7 text-slate-700">
                      <span className="font-semibold text-slate-900">Symptoms:</span>{' '}
                      {entry.symptoms}
                    </p>
                  )}
                  <p className="mt-3 text-sm leading-7 text-slate-700">{entry.notes}</p>
                  {entry.self_care_plan && (
                    <p className="mt-3 text-sm leading-7 text-teal-800">
                      Next step: {entry.self_care_plan}
                    </p>
                  )}
                </article>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
