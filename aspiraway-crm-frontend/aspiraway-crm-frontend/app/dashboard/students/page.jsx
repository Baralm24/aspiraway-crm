"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchStudents() {
      // Get API base URL from env or fall back to Railway backend
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        "https://aspiraway-crm-production.up.railway.app";

      const token = localStorage.getItem("token");

      try {
        const res = await axios.get(`${baseUrl}/api/students`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStudents(res.data || []);
      } catch (err) {
        console.error("Failed to fetch students:", err);
        setError("Failed to load students. Please check authentication.");
      } finally {
        setLoading(false);
      }
    }

    fetchStudents();
  }, []);

  if (loading) {
    return <div className="p-8 text-slate-500">Loading students...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500 font-semibold">{error}</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Students</h1>

      {students.length === 0 ? (
        <p className="text-slate-500">No students found.</p>
      ) : (
        <div className="space-y-2">
          {students.map((s) => (
            <div
              key={s.id}
              className="p-4 border rounded-lg bg-white shadow-sm flex justify-between items-center"
            >
              <div>
                <b className="text-slate-800">
                  {s.user?.name || s.name || "Unnamed Student"}
                </b>
                <p className="text-xs text-slate-500">{s.user?.email}</p>
              </div>
              <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-blue-50 text-blue-700 uppercase">
                {s.status || "LEAD"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}