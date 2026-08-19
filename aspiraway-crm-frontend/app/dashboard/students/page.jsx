"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Users, Search, ExternalLink } from "lucide-react";

export default function StudentsDirectory() {
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const API_BASE =
    process.env.NEXT_PUBLIC_CRM_API_URL ||
    "https://aspiraway-crm.onrender.com";

  useEffect(() => {
    async function loadData() {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await axios.get(`${API_BASE}/api/students`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStudents(res.data || []);
      } catch (err) {
        console.error("Error fetching students:", err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router, API_BASE]);

  const filtered = students.filter(
    (s) =>
      s.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.user?.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 bg-slate-50 min-h-screen text-slate-900 font-sans space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Students Roster</h1>
          <p className="text-sm text-slate-500">Manage and monitor student details</p>
        </div>
        <div className="relative w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Filter students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500">
              <th className="py-3.5 px-5">Student</th>
              <th className="py-3.5 px-5">Email</th>
              <th className="py-3.5 px-5">Current Stage</th>
              <th className="py-3.5 px-5 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {loading ? (
              <tr>
                <td colSpan="4" className="py-8 text-center text-slate-400">Loading...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan="4" className="py-8 text-center text-slate-400">No students recorded.</td>
              </tr>
            ) : (
              filtered.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="py-3.5 px-5 font-semibold">{s.user?.name || "N/A"}</td>
                  <td className="py-3.5 px-5 text-slate-600">{s.user?.email || "N/A"}</td>
                  <td className="py-3.5 px-5">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                      {s.status || "LEAD"}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <button
                      onClick={() => router.push(`/dashboard/students/${s.id}`)}
                      className="text-blue-600 hover:underline flex items-center gap-1 justify-end ml-auto"
                    >
                      View <ExternalLink className="w-3 h-3" />
                    </button>
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