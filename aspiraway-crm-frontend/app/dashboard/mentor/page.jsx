"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, LogOut, Search } from "lucide-react";
import api from "@/lib/api";

export default function MentorsPage() {
  const router = useRouter();
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadMentors() {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        // Calls https://aspiraway-crm.onrender.com/api/mentors
        const res = await api.get("/mentors");
        setMentors(res.data || []);
      } catch (err) {
        console.error("Mentor fetch error:", err?.response?.data || err.message);
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
        }
      } finally {
        setLoading(false);
      }
    }

    loadMentors();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
    router.refresh();
  };

  const filtered = mentors.filter(
    (m) =>
      m.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
      m.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 bg-slate-50 min-h-screen text-slate-900 font-sans space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold">Mentors Directory</h1>
          <p className="text-sm text-slate-500">
            View assigned mentors and active counseling tracks.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter mentors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-red-600 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-lg shadow-sm transition-all"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500">
              <th className="py-3.5 px-5">Mentor</th>
              <th className="py-3.5 px-5">Email</th>
              <th className="py-3.5 px-5">Expertise / Specialization</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {loading ? (
              <tr>
                <td colSpan="3" className="py-8 text-center text-slate-400">
                  Loading mentors...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan="3" className="py-8 text-center text-slate-400">
                  No mentors found.
                </td>
              </tr>
            ) : (
              filtered.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50">
                  <td className="py-3.5 px-5 font-semibold">
                    {m.user?.name || m.name || "N/A"}
                  </td>
                  <td className="py-3.5 px-5 text-slate-600">
                    {m.user?.email || m.email || "N/A"}
                  </td>
                  <td className="py-3.5 px-5 text-slate-600">
                    {m.expertise || "General Higher Ed"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}