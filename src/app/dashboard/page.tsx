'use client';
import { useAuth } from '@/components/SupabaseProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';


export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  if (loading) return <p className="p-4">Loading…</p>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">
        Welcome, {user?.email?.split('@')[0] ?? 'Student'}!
        
      </h1>
      <p className="mt-4">
        🎉 You are now logged in. From here you’ll be able to:
      </p>
      <ul className="list-disc pl-6 mt-2">
        <li>Check symptoms (AI analysis)</li>
        <li>Book appointments</li>
        <li>Read first‑aid guides</li>
        <li>Maintain a private health journal</li>
      </ul>
    </div>
  );
}