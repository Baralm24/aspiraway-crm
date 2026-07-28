'use client';

import { useRouter } from 'next/navigation';
import { GraduationCap, Shield, Users, UserCircle, LogOut } from 'lucide-react';

export default function DashboardLayout({ children }) {
  const router = useRouter();

  const logout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r p-6 space-y-4">
        <h1 className="text-xl font-bold text-blue-600 flex items-center gap-2">
          <GraduationCap /> Aspiraway CRM
        </h1>

        <nav className="space-y-2 pt-6">
          <SidebarButton icon={<Shield />} label="Admin" path="/dashboard/admin" />
          <SidebarButton icon={<Users />} label="Student" path="/dashboard/student" />
          <SidebarButton icon={<GraduationCap />} label="Mentor" path="/dashboard/mentor" />
          <SidebarButton icon={<UserCircle />} label="Counsellor" path="/dashboard/counsellor" />
        </nav>

        <button
          onClick={logout}
          className="flex items-center gap-2 text-red-600 mt-10"
        >
          <LogOut size={18} /> Logout
        </button>
      </aside>

      {/* Content */}
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}

function SidebarButton({ icon, label, path }) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push(path)}
      className="flex items-center gap-3 w-full px-4 py-2 rounded-lg hover:bg-blue-50"
    >
      {icon} {label}
    </button>
  );
}
