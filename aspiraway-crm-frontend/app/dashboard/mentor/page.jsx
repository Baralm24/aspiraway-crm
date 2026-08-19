"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { UserCheck, BookOpen, Clock } from "lucide-react";

export default function MentorDashboard() {
  const router = useRouter();
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE =
    process.env.NEXT_PUBLIC_CRM_API_URL ||
    "https://aspiraway-crm.onrender.com";

  useEffect(() => {
    async function loadMentors() {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await axios.get(`${API_BASE}/api/mentors`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMentors(res.data || []);
      } catch (err) {
        console.error("Mentor fetch error:", err.message);
      } finally {
        setLoading(false);
      }
    }
    loadMentors();
  }, [router, API_BASE]);

  return (
    <div className="p-8 bg-slate-50 min-h-screen text-slate-900 font-sans space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mentors Workspace</h1>
        <p className="text-sm text-slate-500">Track assigned academic advisors and mentors</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <p className="text-slate-400">Loading active mentors...</p>
        ) : mentors.length === 0 ? (
          <p className="text-slate-400">No mentors assigned.</p>
        ) : (
          mentors.map((m) => (
            <div key={m.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{m.name}</h3>
                  <p className="text-xs text-slate-500">{m.email}</p>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                  {m.expertise || "General Advisor"}
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold">
                  {m.status || "ACTIVE"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}