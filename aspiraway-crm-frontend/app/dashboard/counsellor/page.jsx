"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Compass, Mail, Award } from "lucide-react";

export default function CounsellorDashboard() {
  const router = useRouter();
  const [counsellors, setCounsellors] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE =
    process.env.NEXT_PUBLIC_CRM_API_URL ||
    "https://aspiraway-crm.onrender.com";

  useEffect(() => {
    async function loadCounsellors() {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await axios.get(`${API_BASE}/api/counsellors`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCounsellors(res.data || []);
      } catch (err) {
        console.error("Counsellor fetch error:", err.message);
      } finally {
        setLoading(false);
      }
    }
    loadCounsellors();
  }, [router, API_BASE]);

  return (
    <div className="p-8 bg-slate-50 min-h-screen text-slate-900 font-sans space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Counseling Dashboard</h1>
        <p className="text-sm text-slate-500">Manage admissions officers and regional specialists</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <p className="text-slate-400">Loading counsellors...</p>
        ) : counsellors.length === 0 ? (
          <p className="text-slate-400">No counsellors listed.</p>
        ) : (
          counsellors.map((c) => (
            <div key={c.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{c.name}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <Mail className="w-3 h-3" /> {c.email}
                  </p>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span className="flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-slate-400" />
                  {c.specialization || "Admissions Specialist"}
                </span>
                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold">
                  {c.status || "ACTIVE"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}