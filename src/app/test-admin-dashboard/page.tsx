import { ClipboardList, FileCode2, ShieldCheck, Users } from "lucide-react";
import Link from "next/link";

const actions = [
  {
    title: "Create a Test",
    description: "Build coding problems, add test cases, and set duration.",
    href: "/test-admin-dashboard/test_creation",
    icon: FileCode2,
  },
  {
    title: "Created Tests",
    description: "Copy test IDs, review duration, and remove old tests.",
    href: "/test-admin-dashboard/test-display",
    icon: ClipboardList,
  },
  {
    title: "Test Users",
    description: "View registered student accounts.",
    href: "/test-admin-dashboard/test-user-list",
    icon: Users,
  },
  {
    title: "Admin Users",
    description: "Review test admin accounts.",
    href: "/test-admin-dashboard/admin-user-list",
    icon: ShieldCheck,
  },
];

function AdminProfile() {
  return (
    <main className="min-h-screen w-full bg-slate-100 p-6">
      <section className="modern-panel mb-6 rounded-xl p-7">
        <div className="mb-3 inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-700">
          Admin Console
        </div>
        <h1 className="text-3xl font-semibold text-slate-950">Manage coding tests</h1>
        <p className="mt-2 max-w-3xl text-slate-600">
          Create tests, share test IDs with students, and monitor who is using
          the platform.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
          >
            <action.icon className="mb-4 h-8 w-8 text-slate-900" />
            <h2 className="font-semibold text-slate-950">{action.title}</h2>
            <p className="mt-2 text-sm text-slate-600">
              {action.description}
            </p>
          </Link>
        ))}
      </section>
    </main>
  );
}

export default AdminProfile;
