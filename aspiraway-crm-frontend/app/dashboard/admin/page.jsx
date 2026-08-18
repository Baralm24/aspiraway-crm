"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
  Users,
  GitBranch,
  FileCheck,
  GraduationCap,
  Plus,
  Search,
  Filter,
  ExternalLink,
} from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const STATUSES = [
    "LEAD",
    "COUNSELING",
    "SHORTLISTING",
    "SOP",
    "APPLIED",
    "OFFER",
    "VISA",
    "DEPARTED",
  ];

  useEffect(() => {
    async function fetchStudents() {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await axios.get("/api/students", {
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
  }, [router]);

  const statusCounts = STATUSES.reduce((acc, s) => {
    acc[s] = students.filter((st) => st.status === s).length;
    return acc;
  }, {});

  const filteredStudents = students.filter(
    (s) =>
      s.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.user?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 bg-slate-50 min-h-screen text-slate-900 font-sans space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Mentorship CRM Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track student applications, pipeline stages, and counseling workflows.
          </p>
        </div>
        <button
          onClick={() => router.push("/dashboard/admin/students/new")}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium text-sm transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Student
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          icon={<Users className="w-6 h-6" />}
          iconBg="bg-blue-50 text-blue-600"
          title="Total Students"
          value={students.length}
        />
        <StatCard
          icon={<GitBranch className="w-6 h-6" />}
          iconBg="bg-amber-50 text-amber-600"
          title="Active Pipeline"
          value={students.filter((s) => s.status !== "DEPARTED").length}
        />
        <StatCard
          icon={<FileCheck className="w-6 h-6" />}
          iconBg="bg-purple-50 text-purple-600"
          title="Visa Stage"
          value={statusCounts["VISA"] || 0}
        />
        <StatCard
          icon={<GraduationCap className="w-6 h-6" />}
          iconBg="bg-emerald-50 text-emerald-600"
          title="Departed 🎓"
          value={statusCounts["DEPARTED"] || 0}
        />
      </div>

      {/* Pipeline Overview */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-base font-bold text-slate-800 mb-4">
          Pipeline Overview
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {STATUSES.map((s) => (
            <div
              key={s}
              className="bg-slate-50 border border-slate-200/80 p-3 rounded-lg text-center hover:border-slate-300 transition-colors"
            >
              <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase block mb-1">
                {s}
              </span>
              <span className="text-lg font-bold text-slate-900">
                {statusCounts[s] || 0}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Students Directory Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <h2 className="text-base font-bold text-slate-800">Students Directory</h2>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <button className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-slate-600 text-sm font-medium hover:bg-slate-50">
              <Filter className="w-4 h-4" />
              Filter
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                <th className="py-3.5 px-5">Name</th>
                <th className="py-3.5 px-5">Email</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-slate-400">
                    Loading students...
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-slate-400">
                    No students found.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3.5 px-5 font-semibold text-slate-900">
                      {s.user?.name}
                    </td>
                    <td className="py-3.5 px-5 text-slate-600">
                      {s.user?.email}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => router.push(`/dashboard/admin/students/${s.id}`)}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium hover:underline text-xs"
                      >
                        View Profile <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, iconBg }) {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
      {icon && <div className={`p-3 rounded-lg ${iconBg}`}>{icon}</div>}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </p>
        <p className="text-2xl font-bold text-slate-800 mt-0.5">{value}</p>
      </div>
    </div>
  );
}