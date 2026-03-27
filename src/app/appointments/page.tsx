'use client';

import AppointmentCountdownBanner from '@/components/AppointmentCountdownBanner';
import { useAuth } from '@/components/SupabaseProvider';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

type Appointment = {
  id: string;
  appointment_at: string;
  location: string | null;
  notes: string | null;
  reason: string | null;
  status: string;
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

function formatRemainingTime(value: string) {
  const difference = new Date(value).getTime() - Date.now();
  if (difference <= 0) return 'Appointment time reached';
  const hours = Math.floor(difference / 3600000);
  const minutes = Math.floor((difference % 3600000) / 60000);
  return `${hours}h ${minutes}m remaining`;
}

export default function AppointmentsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [appointmentAt, setAppointmentAt] = useState('');
  const [reason, setReason] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, router, user]);

  useEffect(() => {
    if (!user) return;

    const loadAppointments = async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select('id, appointment_at, location, notes, reason, status')
        .eq('user_id', user.id)
        .order('appointment_at', { ascending: true });

      if (error) {
        setError(
          error.code === '42P01'
            ? 'Appointments storage is not ready yet. Run the new Supabase SQL migration first.'
            : error.message
        );
        return;
      }

      setAppointments(data ?? []);
    };

    loadAppointments();
  }, [user]);

  const nextAppointment = useMemo(
    () => appointments.find((item) => item.status === 'scheduled') ?? null,
    [appointments]
  );

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
      .from('appointments')
      .insert({
        user_id: user.id,
        appointment_at: new Date(appointmentAt).toISOString(),
        reason,
        location,
        notes,
        status: 'scheduled',
      })
      .select('id, appointment_at, location, notes, reason, status')
      .single();

    if (error) {
      setError(
        error.code === '42P01'
          ? 'Appointments storage is not ready yet. Run the new Supabase SQL migration first.'
          : error.message
      );
    } else if (data) {
      setAppointments((current) =>
        [...current, data].sort(
          (first, second) =>
            new Date(first.appointment_at).getTime() -
            new Date(second.appointment_at).getTime()
        )
      );
      setAppointmentAt('');
      setReason('');
      setLocation('');
      setNotes('');
      setMessage('Appointment booked successfully.');
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
              Appointment Support
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">
              Book your next visit and keep track of what is coming up
            </h1>

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
                  Appointment date and time
                </label>
                <input
                  type="datetime-local"
                  required
                  value={appointmentAt}
                  onChange={(event) => setAppointmentAt(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-100"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700">
                  Reason for appointment
                </label>
                <input
                  type="text"
                  required
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="e.g. Clinic review for recurring headaches"
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-100"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700">
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="e.g. University clinic, Room 2"
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-100"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700">
                  Notes
                </label>
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Anything you want to remember before the visit."
                  className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-4 text-slate-900 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-100"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-teal-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? 'Booking...' : 'Book appointment'}
              </button>
            </form>
          </section>

          <aside className="rounded-[30px] border border-white/80 bg-[linear-gradient(180deg,_rgba(240,253,250,0.95)_0%,_rgba(255,255,255,0.94)_100%)] p-7 shadow-[0_24px_70px_rgba(14,116,144,0.08)]">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-700">
              Your Schedule
            </p>

            {nextAppointment ? (
              <div className="mt-5 rounded-2xl bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Next appointment
                </p>
                <h2 className="mt-2 text-xl font-semibold text-slate-900">
                  {nextAppointment.reason}
                </h2>
                <p className="mt-2 text-sm text-slate-700">
                  {formatDateTime(nextAppointment.appointment_at)}
                </p>
                {nextAppointment.location && (
                  <p className="mt-2 text-sm text-slate-600">
                    Location: {nextAppointment.location}
                  </p>
                )}
                <p className="mt-4 inline-flex rounded-full bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800">
                  {formatRemainingTime(nextAppointment.appointment_at)}
                </p>
              </div>
            ) : (
              <div className="mt-5 rounded-2xl bg-white p-5 text-sm leading-7 text-slate-600 shadow-sm">
                No appointment has been booked yet.
              </div>
            )}

            <div className="mt-5 space-y-4">
              {appointments.map((appointment) => (
                <article key={appointment.id} className="rounded-2xl bg-white p-4 shadow-sm">
                  <p className="text-sm font-semibold text-slate-900">
                    {appointment.reason || 'Scheduled appointment'}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    {formatDateTime(appointment.appointment_at)}
                  </p>
                  {appointment.location && (
                    <p className="mt-1 text-sm text-slate-600">
                      Location: {appointment.location}
                    </p>
                  )}
                  {appointment.notes && (
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      {appointment.notes}
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
