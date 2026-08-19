"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { UserCheck, Mail, Shield } from "lucide-react";

export default function CounsellorPage() {
  const [counsellors, setCounsellors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCounsellors() {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get("https://aspiraway-crm.onrender.com/api/counsellors", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCounsellors(res.data || []);
      } catch (err) {
        console.error("Fetch counsellors error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCounsellors();
  }, []);

  return (
    <div className="p-8 bg-slate-50 min-h-screen font-sans">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Counsellors</h1>
        <p className="text-xs text-slate-500 mt-1">Assigned counselors managing student application workflows</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm">Loading counsellors...</div>
        ) : (
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-semibold text-xs uppercase tracking-wider">
                <th className="p-4">Counsellor</th>
                <th className="p-4">Email</th>
                <th className="p-4">Specialization</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {counsellors.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 font-semibold text-slate-800">{c.name}</td>
                  <td className="p-4 text-slate-600"><Mail className="w-3.5 h-3.5 inline mr-1 text-slate-400" />{c.email}</td>
                  <td className="p-4 text-slate-600">{c.specialization || "Higher Education"}</td>
                  <td className="p-4"><span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold text-[10px] rounded-full uppercase border border-emerald-200">ACTIVE</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}