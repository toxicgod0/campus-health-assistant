'use client';

import AppointmentCountdownBanner from '@/components/AppointmentCountdownBanner';
import { useAuth } from '@/components/SupabaseProvider';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type SymptomResult = {
  urgency: string;
  likelyConcern: string;
  recommendations: string[];
  note: string;
};

const COMMON_SYMPTOMS = [
  'Headache',
  'Fever',
  'Cough',
  'Sore throat',
  'Stomach pain',
  'Nausea',
  'Fatigue',
  'Dizziness',
];

export default function SymptomGuidancePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [duration, setDuration] = useState('today');
  const [severity, setSeverity] = useState('mild');
  const [result, setResult] = useState<SymptomResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, router, user]);

  if (loading) {
    return <div className="min-h-screen bg-[#eef8f7]" />;
  }

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((current) =>
      current.includes(symptom)
        ? current.filter((item) => item !== symptom)
        : [...current, symptom]
    );
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setAiLoading(true);
    setAiError(null);
    setResult(null);
    try {
      const res = await fetch('/api/health-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'symptom',
          symptoms: selectedSymptoms,
          additionalDetails,
          duration,
          severity,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Request failed');
      setResult(data);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setAiLoading(false);
    }
  };

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
              Symptom Guidance
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">
              Describe how you feel and get a structured next-step review
            </h1>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              This page gives a calm, readable summary of possible urgency and
              what to do next. It is a safe placeholder until we connect
              MedGemma for stronger AI analysis.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700">
                  Common symptoms
                </label>
                <div className="mt-3 flex flex-wrap gap-3">
                  {COMMON_SYMPTOMS.map((symptom) => {
                    const active = selectedSymptoms.includes(symptom);
                    return (
                      <button
                        key={symptom}
                        type="button"
                        onClick={() => toggleSymptom(symptom)}
                        className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                          active
                            ? 'bg-teal-700 text-white shadow-sm'
                            : 'bg-teal-50 text-teal-800 hover:bg-teal-100'
                        }`}
                      >
                        {symptom}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700">
                  Extra details
                </label>
                <textarea
                  value={additionalDetails}
                  onChange={(event) => setAdditionalDetails(event.target.value)}
                  rows={5}
                  placeholder="Describe what you are feeling, when it started, and anything that makes it better or worse."
                  className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-100"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-700">
                    Duration
                  </label>
                  <select
                    value={duration}
                    onChange={(event) => setDuration(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-100"
                  >
                    <option value="today">Started today</option>
                    <option value="few-days">A few days</option>
                    <option value="more-than-week">More than a week</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700">
                    Severity
                  </label>
                  <select
                    value={severity}
                    onChange={(event) => setSeverity(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-100"
                  >
                    <option value="mild">Mild</option>
                    <option value="moderate">Moderate</option>
                    <option value="severe">Severe</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={aiLoading}
                className="rounded-full bg-teal-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:opacity-60"
              >
                {aiLoading ? 'Analysing…' : 'Submit symptoms'}
              </button>
            </form>
          </section>

          <aside className="rounded-[30px] border border-white/80 bg-[linear-gradient(180deg,_rgba(240,253,250,0.95)_0%,_rgba(255,255,255,0.94)_100%)] p-7 shadow-[0_24px_70px_rgba(14,116,144,0.08)]">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-700">
              Assistant Output
            </p>

            {aiError && (
              <div className="mt-5 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
                {aiError}
              </div>
            )}

            {aiLoading && (
              <div className="mt-5 rounded-3xl bg-white p-5 text-sm leading-7 text-slate-500 shadow-sm">
                MedGemma is reviewing your symptoms…
              </div>
            )}

            {result ? (
              <div className="mt-5 space-y-5">
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Likely urgency
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    {result.urgency}
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Assistant review
                  </p>
                  <p className="mt-2 text-sm leading-7 text-slate-700">
                    {result.likelyConcern}
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Recommendations
                  </p>
                  <ul className="mt-3 space-y-3 text-sm leading-7 text-slate-700">
                    {result.recommendations.map((item) => (
                      <li key={item} className="rounded-xl bg-slate-50 px-3 py-3">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <p className="text-xs leading-6 text-slate-500">{result.note}</p>
              </div>
            ) : (
              <div className="mt-5 rounded-3xl bg-white p-5 text-sm leading-7 text-slate-600 shadow-sm">
                Submit your symptoms to see a structured guidance summary here.
              </div>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
