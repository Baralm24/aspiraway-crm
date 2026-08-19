"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://aspiraway-crm-production.up.railway.app";

  useEffect(() => {
    async function fetchStudents() {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get(`${API_BASE}/api/students`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStudents(res.data || []);
      } catch (err) {
        console.error("Failed to fetch students:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStudents();
  }, [API_BASE]);

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-slate-900">Student Directory</h1>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-6 text-slate-500 text-sm">Loading students...</div>
        ) : students.length === 0 ? (
          <div className="p-6 text-slate-500 text-sm">No students found.</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="p-4 font-medium text-slate-800">
                    {s.user?.name || s.name || "Unnamed"}
                  </td>
                  <td className="p-4 text-slate-600">{s.user?.email || "N/A"}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-bold text-xs rounded-full border border-blue-200 uppercase">
                      {s.status || "LEAD"}
                    </span>
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