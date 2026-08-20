"use client";

import { useRouter } from "next/navigation";
import { LogOut, LayoutDashboard } from "lucide-react";

export default function DashboardHeader({ title, description }) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-200 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        {description && <p className="text-sm text-slate-500 mt-0.5">{description}</p>}
      </div>

      <button
        type="button"
        onClick={handleLogout}
        className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-red-600 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-lg shadow-sm transition-all"
      >
        <LogOut className="w-4 h-4" />
        Logout
      </button>
    </div>
  );
}