'use client';

import { supabase } from '@/lib/supabaseClient';
import { useEffect, useMemo, useState } from 'react';

type AppointmentRecord = {
  id: string;
  appointment_at: string;
  reason: string | null;
};

type AppointmentCountdownBannerProps = {
  userId?: string;
};

function formatTimeLeft(targetDate: string) {
  const difference = new Date(targetDate).getTime() - Date.now();

  if (difference <= 0) {
    return 'Appointment time has arrived.';
  }

  const totalMinutes = Math.floor(difference / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m remaining`;
  }

  return `${hours}h ${minutes}m remaining`;
}

function formatAppointmentDate(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(date));
}

export default function AppointmentCountdownBanner({
  userId,
}: AppointmentCountdownBannerProps) {
  const [appointment, setAppointment] = useState<AppointmentRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!userId) return;

    let isMounted = true;

    const fetchUpcomingAppointment = async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('appointments')
        .select('id, appointment_at, reason')
        .eq('user_id', userId)
        .eq('status', 'scheduled')
        .gte('appointment_at', now)
        .order('appointment_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (!isMounted) return;

      if (error) {
        setError(error.code === '42P01' ? 'appointments-table-missing' : error.message);
        return;
      }

      setAppointment(data);
    };

    fetchUpcomingAppointment();

    const timeout = window.setTimeout(() => {
      setTick(Date.now());
    }, 0);

    const interval = window.setInterval(() => {
      setTick(Date.now());
    }, 60000);

    return () => {
      isMounted = false;
      window.clearTimeout(timeout);
      window.clearInterval(interval);
    };
  }, [userId]);

  const isDueSoon = useMemo(() => {
    if (!appointment) return false;
    const difference = new Date(appointment.appointment_at).getTime() - tick;
    return difference > 0 && difference <= 24 * 60 * 60 * 1000;
  }, [appointment, tick]);

  if (!userId || error === 'appointments-table-missing' || !appointment || !isDueSoon) {
    return null;
  }

  return (
    <div className="sticky top-4 z-20 mx-auto mb-4 w-full max-w-6xl rounded-2xl border border-amber-200 bg-[linear-gradient(90deg,_#fff8e8_0%,_#fff1bf_100%)] px-5 py-4 shadow-[0_12px_30px_rgba(217,119,6,0.12)]">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
        Appointment Reminder
      </p>
      <div className="mt-2 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-base font-semibold text-slate-900">
            {appointment.reason || 'Upcoming appointment'}
          </p>
          <p className="text-sm text-slate-700">
            Scheduled for {formatAppointmentDate(appointment.appointment_at)}
          </p>
        </div>
        <div className="rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-amber-800">
          {formatTimeLeft(appointment.appointment_at)}
        </div>
      </div>
    </div>
  );
}
