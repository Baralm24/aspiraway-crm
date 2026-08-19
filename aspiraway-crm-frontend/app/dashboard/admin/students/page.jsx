"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { UserPlus, Eye, Mail } from "lucide-react";

export default function StudentsDirectoryPage() {
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStudents() {
      const token = localStorage.getItem("token");
      if (!token) return router.push("/login");

      try {
        const res = await axios.get("https://aspiraway-crm.onrender.com/api/students", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStudents(res.data || []);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStudents();
  }, [router]);

  return (
    <div className="p-8 bg-slate-50 min-h-screen font-sans">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Students Directory</h1>
          <p className="text-xs text-slate-500 mt-1">Manage all student applications and leads</p>
        </div>
        <button
          onClick={() => router.push("/dashboard/admin/students/new")}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-xs transition-all shadow-sm"
        >
          <UserPlus className="w-4 h-4" /> Add Student
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm">Loading students...</div>
        ) : students.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">No students found. Click "Add Student" to create one.</div>
        ) : (
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-semibold text-xs uppercase tracking-wider">
                <th className="p-4">Student</th>
                <th className="p-4">Email</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 font-semibold text-slate-800 capitalize">{s.user?.name || "N/A"}</td>
                  <td className="p-4 text-slate-600 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400" /> {s.user?.email}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-bold text-[10px] rounded-full uppercase border border-blue-200">
                      {s.status || "LEAD"}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => router.push(`/dashboard/admin/students/${s.id}`)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}