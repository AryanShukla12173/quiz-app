'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  FileCode,
  User,
  Users,
  ShieldCheck,
  LogOut,
  ListChecks,
  Menu
} from 'lucide-react'
import { JSX, useState } from 'react'
import { app } from '@/lib/connectDatabase'
import { getAuth, signOut } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import { useAuth, UserRole } from '@/context/AuthContext'

const iconMap: Record<string, JSX.Element> = {
  'Profile': <User className="w-4 h-4 mr-2" />,
  'Admin User List': <ShieldCheck className="w-4 h-4 mr-2" />,
  'Quiz App User List': <Users className="w-4 h-4 mr-2" />,
  'Admin User Management': <ShieldCheck className="w-4 h-4 mr-2" />,
  'Quiz App User Management': <Users className="w-4 h-4 mr-2" />,
  'Challenge Management': <ListChecks className="w-4 h-4 mr-2" />,
  'Challenge Creation': <FileCode className="w-4 h-4 mr-2" />,
}

const adminActions = [
  { label: 'Profile', href: '/dashboard' },
  { label: 'Admin User List', href: '/dashboard/admin_user_management' },
  { label: 'Quiz App User List', href: '/dashboard/quiz_user_management' },
  { label: 'Challenge Management', href: '/dashboard/history' },
  { label: 'Challenge Creation', href: '/dashboard/challenges' },
]

const superAdminActions = [
  { label: 'Profile', href: '/dashboard' },
  { label: 'Challenge Creation', href: '/dashboard/challenges' },
  { label: 'Challenge Management', href: '/dashboard/history' },
  { label: 'Admin User Management', href: '/dashboard/admin_user_management' },
  { label: 'Quiz App User Management', href: '/dashboard/quiz_user_management' },
]

const auth = getAuth(app)

export default function DashboardSidebar({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { role } = useAuth()

  const dashboardActions = role === UserRole.quiz_app_superadmin ? superAdminActions : adminActions

  async function logOut() {
    try {
      await signOut(auth)
      router.push('/')
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="drawer lg:drawer-open min-h-screen"  data-theme="dark">
      <input
        id="sidebar-drawer"
        type="checkbox"
        className="drawer-toggle"
        checked={open}
        onChange={() => setOpen(!open)}
      />

      {/* Main content */}
      <div className="drawer-content flex flex-col">
        <div className="lg:hidden p-4">
          <label htmlFor="sidebar-drawer" className="btn btn-sm btn-primary">
            <Menu className="w-5 h-5" />
          </label>
        </div>
        <div className="px-4 pb-4">
          {children}
        </div>
      </div>

      {/* Sidebar */}
      <div className="drawer-side z-40">
        <label htmlFor="sidebar-drawer" className="drawer-overlay lg:hidden" />
        <aside className="w-64 min-h-screen bg-primary text-primary-content p-4 space-y-4">
          <div className="text-2xl font-bold px-2">QuizApp</div>
          <ul className="menu space-y-1">
            {dashboardActions.map(({ label, href }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center px-4 py-2 rounded-lg transition',
                    pathname === href
                      ? 'bg-base-100 text-base-content shadow font-semibold'
                      : 'hover:bg-primary-focus'
                  )}
                >
                  {iconMap[label]}
                  {label}
                </Link>
              </li>
            ))}
            <li className="mt-4">
              <button
                onClick={logOut}
                className="flex items-center px-4 py-2 rounded-lg transition hover:bg-error hover:text-error-content w-full"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </li>
          </ul>
        </aside>
      </div>
    </div>
  )
}
