'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, FileCode, User, History, LogOut } from 'lucide-react';
import { JSX } from 'react';
import { Button } from './ui/button';
import { app } from '@/lib/connectDatabase';
import { getAuth, signOut } from "firebase/auth";
import { useRouter } from 'next/navigation';

const iconMap: Record<string, JSX.Element> = {
  Home: <Home className="w-4 h-4 mr-2" />,
  'Challenge Creation': <FileCode className="w-4 h-4 mr-2" />,
  Profile: <User className="w-4 h-4 mr-2" />,
  'Code Test History': <History className="w-4 h-4 mr-2" />
};

const dashboardActions = [
  { label: 'Home', href: '/dashboard' },
  { label: 'Challenge Creation', href: '/dashboard/challenges' },
  { label: 'Profile', href: '/dashboard/profile' },
  { label: 'Code Test History', href: '/dashboard/history' },
];

const auth = getAuth(app);

export default function DashboardSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  async function logOut() {
    try {
      await signOut(auth);
      // Optionally, redirect the user after logging out
      router.push('/login'); // replace with your desired URL
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <aside className="w-64 min-h-screen h-screen p-6 bg-gradient-to-b from-violet-600 to-purple-500 text-white shadow-lg rounded-r-2xl">
      <div className="mb-8 text-2xl font-bold tracking-wide">QuizApp</div>

      <nav className="space-y-2">
        {dashboardActions.map(({ label, href }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center px-4 py-2 rounded-lg transition-colors',
              pathname === href
                ? 'bg-white text-purple-700 shadow font-semibold'
                : 'hover:bg-purple-400/30'
            )}
          >
            {iconMap[label]}
            {label}
          </Link>
        ))}
        <div
          onClick={logOut}
          className="flex items-center px-4 py-2 rounded-lg transition-colors cursor-pointer hover:bg-purple-400/30 mt-6"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </div>
      </nav>
    </aside>
  );
}
