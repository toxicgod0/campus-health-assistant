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
      className="rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300"
    >
      Log out
    </button>
  );
}