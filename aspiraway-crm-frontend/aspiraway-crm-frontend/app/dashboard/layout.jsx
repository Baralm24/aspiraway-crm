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
      <aside className="w-64 bg-white border-r p-6 flex flex-col justify-between">
        <div className="space-y-4">
          <h1 className="text-xl font-bold text-blue-600 flex items-center gap-2">
            <GraduationCap /> Aspiraway CRM
          </h1>

          <nav className="space-y-2 pt-6">
            <SidebarButton icon={<Shield />} label="Admin" path="/dashboard/admin" />
            <SidebarButton icon={<Users />} label="Student" path="/dashboard/students" />
            <SidebarButton icon={<GraduationCap />} label="Mentor" path="/dashboard/mentor" />
            <SidebarButton icon={<UserCircle />} label="Counsellor" path="/dashboard/counsellor" />
          </nav>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium text-sm transition-colors pt-6 border-t"
        >
          <LogOut size={18} /> Logout
        </button>
      </aside>

      {/* Content */}
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}

function SidebarButton({ icon, label, path }) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push(path)}
      className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-slate-700 font-medium hover:bg-blue-50 hover:text-blue-600 transition-all text-sm"
    >
      {icon} {label}
    </button>
  );
}