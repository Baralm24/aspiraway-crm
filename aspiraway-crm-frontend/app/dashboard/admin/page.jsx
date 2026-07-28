"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const STATUSES = ["LEAD", "COUNSELING", "SHORTLISTING", "SOP", "APPLIED", "OFFER", "VISA", "DEPARTED"];

  useEffect(() => {
    async function fetchStudents() {
      try {
        const res = await axios.get("http://localhost:3001/api/students", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStudents(res.data);
      } catch (err) {
        console.error("FETCH ERROR:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchStudents();
  }, []);

  const statusCounts = STATUSES.reduce((acc, s) => {
    acc[s] = students.filter((st) => st.status === s).length;
    return acc;
  }, {});

  if (loading) return <div className="p-10">Loading...</div>;

  return (
    <div className="p-10 bg-gray-50 min-h-screen space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Mentorship CRM Dashboard</h1>
        <button
          onClick={() => router.push("/dashboard/admin/students/new")}
          className="bg-black text-white px-4 py-2 rounded"
        >
          ➕ Add Student
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard title="Total Students" value={students.length} />
        <StatCard title="Active Pipeline" value={students.filter(s => s.status !== "DEPARTED").length} />
        <StatCard title="Visa Stage" value={statusCounts["VISA"] || 0} />
        <StatCard title="Departed 🎓" value={statusCounts["DEPARTED"] || 0} />
      </div>

      <div className="bg-white p-6 rounded shadow space-y-4">
        <h2 className="text-xl font-semibold">Pipeline Overview</h2>
        <div className="grid grid-cols-4 gap-4">
          {STATUSES.map((s) => (
            <StatCard key={s} title={s} value={statusCounts[s] || 0} />
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Students</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">Name</th>
              <th className="border p-2 text-left">Email</th>
              <th className="border p-2 text-left">Status</th>
              <th className="border p-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="border p-2">{s.user.name}</td>
                <td className="border p-2">{s.user.email}</td>
                <td className="border p-2">{s.status}</td>
                <td className="border p-2">
                  <button
                    onClick={() => router.push(`/dashboard/admin/students/${s.id}`)}
                    className="text-blue-600 hover:underline"
                  >
                    View Profile →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-white p-4 rounded shadow text-center">
      <h3 className="text-gray-500">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
