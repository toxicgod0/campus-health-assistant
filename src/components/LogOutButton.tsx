'use client';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  return (
    <button
      onClick={handleLogout}
      className="rounded-full border border-teal-200 bg-white/85 px-4 py-2 text-sm font-semibold text-teal-800 shadow-sm transition hover:bg-teal-50"
    >
      Log out
    </button>
  );
}
