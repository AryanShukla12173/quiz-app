'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  FileCode,
  User,
  Users,
  ShieldCheck,
  LogOut,
  ListChecks,
} from 'lucide-react';
import { JSX } from 'react';
import { app } from '@/lib/connectDatabase';
import { getAuth, signOut } from "firebase/auth";
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/context/AuthContext';

const iconMap: Record<string, JSX.Element> = {
  'Profile': <User className="w-4 h-4 mr-2" />,
  'Admin User List': <ShieldCheck className="w-4 h-4 mr-2" />,
  'Quiz App User List': <Users className="w-4 h-4 mr-2" />,
  'Admin User Management': <ShieldCheck className="w-4 h-4 mr-2" />,
  'Quiz App User Management': <Users className="w-4 h-4 mr-2" />,
  'Challenge Management': <ListChecks className="w-4 h-4 mr-2" />,
  'Challenge Creation': <FileCode className="w-4 h-4 mr-2" />,
};

// Define admin and superadmin actions
const adminActions = [
  { label: 'Profile', href: '/dashboard' },
  { label: 'Admin User List', href: '/dashboard/admin_user_management' },
  { label: 'Quiz App User List', href: '/dashboard/quiz_user_management' },
  { label: 'Challenge Management', href: '/dashboard/history' },
  { label: 'Challenge Creation', href: '/dashboard/challenges' },
  
];

const superAdminActions = [
  { label: 'Profile', href: '/dashboard' },
  { label: 'Challenge Creation', href: '/dashboard/challenges' },
  { label: 'Challenge Management', href: '/dashboard/history' },
  { label: 'Admin User Management', href: '/dashboard/admin_user_management' },
  { label: 'Quiz App User Management', href: '/dashboard/quiz_user_management' },
];

const auth = getAuth(app);

export default function DashboardSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { role } = useAuth(); // Access user role from AuthContext

  async function logOut() {
    try {
      await signOut(auth);
      router.push('/'); // Redirect to homepage after logout
    } catch (error) {
      console.error(error);
    }
  }

  // Determine which actions to display based on role
  const dashboardActions = role === UserRole.quiz_app_superadmin ? superAdminActions : adminActions;

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