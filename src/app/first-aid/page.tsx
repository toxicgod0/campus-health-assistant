'use client';

import AppointmentCountdownBanner from '@/components/AppointmentCountdownBanner';
import { useAuth } from '@/components/SupabaseProvider';
import { buildFirstAidGuidance } from '@/lib/healthAssistant';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const PROBLEMS = [
  { value: 'bruises', label: 'Bruises' },
  { value: 'nosebleed', label: 'Nosebleeding' },
  { value: 'burns', label: 'Burns' },
  { value: 'cuts', label: 'Cuts' },
  { value: 'sprain', label: 'Sprain' },
  { value: 'other', label: 'Other' },
];

export default function FirstAidPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [problem, setProblem] = useState('bruises');
  const [details, setDetails] = useState('');
  const [result, setResult] = useState<ReturnType<typeof buildFirstAidGuidance> | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, router, user]);

  if (loading) {
    return <div className="min-h-screen bg-[#eef8f7]" />;
  }

  return (
    <main className="min-h-screen bg-[#eef8f7] px-4 py-6 text-slate-800 sm:px-6 lg:px-8">
      <AppointmentCountdownBanner userId={user?.id} />

      <div className="mx-auto max-w-6xl">
        <Link href="/dashboard" className="text-sm font-semibold text-teal-700 hover:text-teal-900">
          Back to dashboard
        </Link>

        <div className="mt-4 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[30px] border border-white/80 bg-white/90 p-7 shadow-[0_24px_70px_rgba(15,118,110,0.08)]">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-700">
              First Aid Help
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">
              Tell the assistant what is happening and get calm first-aid tips
            </h1>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              This gives supportive first-aid steps while we prepare for a later
              MedGemma integration.
            </p>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                setResult(buildFirstAidGuidance({ problem, details }));
              }}
              className="mt-8 space-y-6"
            >
              <div>
                <label className="block text-sm font-semibold text-slate-700">
                  Current problem
                </label>
                <select
                  value={problem}
                  onChange={(event) => setProblem(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-100"
                >
                  {PROBLEMS.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700">
                  Extra details
                </label>
                <textarea
                  rows={5}
                  value={details}
                  onChange={(event) => setDetails(event.target.value)}
                  placeholder="Describe what happened, how long ago it happened, and whether the person is in severe pain or bleeding."
                  className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-100"
                />
              </div>

              <button
                type="submit"
                className="rounded-full bg-teal-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-800"
              >
                Get first-aid tips
              </button>
            </form>
          </section>

          <aside className="rounded-[30px] border border-white/80 bg-[linear-gradient(180deg,_rgba(240,253,250,0.95)_0%,_rgba(255,255,255,0.94)_100%)] p-7 shadow-[0_24px_70px_rgba(14,116,144,0.08)]">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-700">
              Guidance Panel
            </p>

            {result ? (
              <div className="mt-5 space-y-5">
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <h2 className="text-lg font-semibold text-slate-900">
                    {result.summary}
                  </h2>
                  <p className="mt-3 text-xs leading-6 text-slate-500">{result.note}</p>
                </div>

                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Immediate steps
                  </p>
                  <ul className="mt-3 space-y-3 text-sm leading-7 text-slate-700">
                    {result.tips.map((tip) => (
                      <li key={tip} className="rounded-xl bg-slate-50 px-3 py-3">
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    When to seek medical help
                  </p>
                  <ul className="mt-3 space-y-3 text-sm leading-7 text-slate-700">
                    {result.getHelp.map((item) => (
                      <li key={item} className="rounded-xl bg-amber-50 px-3 py-3 text-amber-900">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-3xl bg-white p-5 text-sm leading-7 text-slate-600 shadow-sm">
                Choose a problem and submit the form to see first-aid support
                tips here.
              </div>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
