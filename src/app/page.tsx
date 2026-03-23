import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';

export default async function HomePage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect('/dashboard');
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-16">
      <div className="w-full max-w-3xl rounded-3xl bg-white p-10 shadow-lg">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-700">
          Campus Health Assistant
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900">
          Private health support for university students.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-600">
          Sign up to access symptom guidance, health journaling, appointment
          support, and first-aid resources in one place.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/signup"
            className="rounded-lg bg-teal-600 px-6 py-3 text-center font-semibold text-white transition hover:bg-teal-700"
          >
            Create account
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-slate-300 px-6 py-3 text-center font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Log in
          </Link>
        </div>
      </div>
    </main>
  );
}
