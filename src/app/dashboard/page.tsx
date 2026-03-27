'use client';

import AppointmentCountdownBanner from '@/components/AppointmentCountdownBanner';
import LogoutButton from '@/components/LogOutButton';
import { useAuth } from '@/components/SupabaseProvider';
import UsernameCard from '@/components/UsernameCard';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const features = [
  {
    title: 'Symptom guidance',
    description:
      'Get a quick, structured view of what your symptoms may mean and when it may be wise to seek urgent care.',
    href: '/symptom-guidance',
    cta: 'Open symptom guidance',
  },
  {
    title: 'Appointment support',
    description:
      'Keep your clinic planning simple with a space that can guide you toward booking and preparing for visits.',
    href: '/appointments',
    cta: 'Manage appointments',
  },
  {
    title: 'First-aid help',
    description:
      'Read practical first-aid tips for common situations while you decide on the safest next step.',
    href: '/first-aid',
    cta: 'Get first-aid help',
  },
  {
    title: 'Private health journal',
    description:
      'Track symptoms, recovery notes, and personal health patterns in one place that is easy to revisit.',
    href: '/health-journal',
    cta: 'Open journal',
  },
];

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const displayName =
    user?.user_metadata?.username ||
    user?.user_metadata?.display_name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'Student';

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f3fbfa] px-4">
        <p className="rounded-full bg-white px-5 py-3 text-sm font-medium text-slate-600 shadow-sm">
          Loading your dashboard...
        </p>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#eff8f7] text-slate-800">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.22),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(125,211,252,0.2),_transparent_32%),linear-gradient(180deg,_#f7fcfb_0%,_#eef7f6_55%,_#e7f2f2_100%)]" />
      <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(15,118,110,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(15,118,110,0.08)_1px,transparent_1px)] [background-size:44px_44px]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-6 sm:px-8 lg:px-10">
        <AppointmentCountdownBanner userId={user?.id} />

        <header className="flex flex-col gap-4 rounded-[28px] border border-white/70 bg-white/75 px-6 py-5 shadow-[0_24px_70px_rgba(15,118,110,0.08)] backdrop-blur md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-700">
              Campus Health Assistant
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Welcome, {displayName}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              This space is designed to feel calm, clear, and supportive. Use it
              to understand your health options, organize care, and find the
              right next step with confidence.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:items-end">
            <div className="rounded-2xl bg-teal-50 px-4 py-3 text-sm text-teal-900">
              Signed in as
              <p className="mt-1 break-all font-semibold">{user?.email}</p>
            </div>
            <LogoutButton />
          </div>
        </header>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.35fr_0.9fr]">
          <div className="rounded-[32px] border border-white/70 bg-white/85 p-7 shadow-[0_28px_80px_rgba(15,23,42,0.08)] backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-700">
              Your Care Hub
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
              A gentle starting point for everyday student health support
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">
              Whether you want quick symptom guidance, a reminder to seek
              medical help, or a place to keep personal health notes, this
              dashboard brings the essentials together in one welcoming space.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {features.map((feature) => (
                <Link
                  key={feature.title}
                  href={feature.href}
                  className="rounded-[24px] border border-teal-100 bg-[linear-gradient(180deg,_#ffffff_0%,_#f5fbfb_100%)] p-5 shadow-sm"
                >
                  <div className="inline-flex rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">
                    Care option
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-slate-900">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {feature.description}
                  </p>
                  <p className="mt-5 text-sm font-semibold text-teal-700">
                    {feature.cta}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          <aside className="rounded-[32px] border border-white/70 bg-[linear-gradient(180deg,_rgba(13,148,136,0.12)_0%,_rgba(255,255,255,0.9)_100%)] p-7 shadow-[0_28px_80px_rgba(14,116,144,0.08)] backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-700">
              How This Helps
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-900">
              Built to make health support feel easier to approach
            </h2>

            <div className="mt-6 space-y-4">
              <div className="rounded-2xl bg-white/85 p-4 shadow-sm">
                <h3 className="text-base font-semibold text-slate-900">
                  Clear next steps
                </h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Instead of leaving you with vague information, the app is
                  meant to guide you toward what to read, track, or do next.
                </p>
              </div>

              <div className="rounded-2xl bg-white/85 p-4 shadow-sm">
                <h3 className="text-base font-semibold text-slate-900">
                  Student-friendly support
                </h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  The experience is meant to work for all students, including
                  those using personal email accounts and managing care
                  independently.
                </p>
              </div>

              <div className="rounded-2xl bg-white/85 p-4 shadow-sm">
                <h3 className="text-base font-semibold text-slate-900">
                  A calm interface
                </h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  The lighter layout is designed to feel more like a welcoming
                  clinic front desk than a technical admin screen.
                </p>
              </div>
            </div>
          </aside>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.25fr]">
          <UsernameCard
            canChange={!Boolean(user?.user_metadata?.username_change_used)}
            initialUsername={user?.user_metadata?.username ?? ''}
          />

          <div className="rounded-[32px] border border-white/70 bg-white/85 p-7 shadow-[0_28px_80px_rgba(15,23,42,0.08)] backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-700">
              Personal touch
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-900">
              A more human welcome for every student
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Usernames let the app greet people in a friendlier way without
              depending on an email address. This is especially helpful for
              students who sign in with personal Gmail accounts or shared naming
              patterns that do not feel personal.
            </p>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              I have also added a database migration file so your Supabase
              project can store usernames in a dedicated profile record, not
              just auth metadata, when you are ready to run it.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
