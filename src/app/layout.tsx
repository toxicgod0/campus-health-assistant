import './globals.css';
import { Inter } from 'next/font/google';
import { SupabaseProvider } from '@/components/SupabaseProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Campus Health Assistant',
  description: 'Preliminary health guidance for Maseno University students',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SupabaseProvider>{children}</SupabaseProvider>
      </body>
    </html>
  );
}