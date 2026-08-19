"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api"; // Import the central api instance

export default function MentorPage() {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMentors() {
      try {
        // Automatically calls https://aspiraway-crm.onrender.com/api/mentors
        const res = await api.get("/api/mentors");
        setMentors(res.data || []);
      } catch (err) {
        console.error("Error fetching mentors:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchMentors();
  }, []);

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-slate-900">Mentors</h1>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-6 text-slate-500 text-sm">Loading mentors...</div>
        ) : mentors.length === 0 ? (
          <div className="p-6 text-slate-500 text-sm">No mentors found.</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold">
              <tr>
                <th className="p-4">Mentor</th>
                <th className="p-4">Email</th>
                <th className="p-4">Expertise</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mentors.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50">
                  <td className="p-4 font-medium text-slate-800">{m.name}</td>
                  <td className="p-4 text-slate-600">{m.email}</td>
                  <td className="p-4 text-slate-600">{m.expertise}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-full border border-emerald-200">
                      {m.status}
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