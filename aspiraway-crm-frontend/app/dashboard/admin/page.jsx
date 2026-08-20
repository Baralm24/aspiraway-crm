"use client";

import { useEffect, useState } from "react";
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
  LogOut,
  ArrowUpRight,
  ChevronRight,
} from "lucide-react";
import api from "@/lib/api";

export default function AdminDashboard() {
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStage, setSelectedStage] = useState("ALL");

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
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : "";
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await api.get("/students");
        setStudents(res.data || []);
      } catch (err) {
        console.error("FETCH ERROR:", err.response?.data || err.message);
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
        }
      } finally {
        setLoading(false);
      }
    }
    fetchStudents();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
    router.refresh();
  };

  // Aggregate pipeline counts
  const statusCounts = STATUSES.reduce((acc, s) => {
    acc[s] = students.filter((st) => st.status === s).length;
    return acc;
  }, {});

  // Search and Stage Filtering
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.user?.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStage =
      selectedStage === "ALL" ? true : s.status === selectedStage;

    return matchesSearch && matchesStage;
  });

  // Dynamic Badge Color Mapping
  const getBadgeStyle = (status) => {
    switch (status) {
      case "LEAD":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "COUNSELING":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "SHORTLISTING":
        return "bg-sky-50 text-sky-700 border-sky-200";
      case "SOP":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "APPLIED":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "OFFER":
        return "bg-teal-50 text-teal-700 border-teal-200";
      case "VISA":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "DEPARTED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen text-slate-900 font-sans space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Counseling Operations Overview
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track student application pipelines, stage progressions, and active workflows.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/dashboard/admin/students/new")}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium text-sm transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Student
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 px-3.5 py-2.5 text-sm font-semibold text-slate-600 hover:text-red-600 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-lg shadow-sm transition-all"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      {/* Top Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          icon={<Users className="w-6 h-6" />}
          iconBg="bg-blue-50 text-blue-600"
          title="Total Candidates"
          value={students.length}
          subtext="Total registered profiles"
        />
        <StatCard
          icon={<GitBranch className="w-6 h-6" />}
          iconBg="bg-amber-50 text-amber-600"
          title="Active Pipeline"
          value={students.filter((s) => s.status !== "DEPARTED").length}
          subtext="Students in active progression"
        />
        <StatCard
          icon={<FileCheck className="w-6 h-6" />}
          iconBg="bg-purple-50 text-purple-600"
          title="Visa Stage"
          value={statusCounts["VISA"] || 0}
          subtext="Preparing or submitted visa"
        />
        <StatCard
          icon={<GraduationCap className="w-6 h-6" />}
          iconBg="bg-emerald-50 text-emerald-600"
          title="Departed"
          value={statusCounts["DEPARTED"] || 0}
          subtext="Successfully enrolled abroad"
        />
      </div>

      {/* Pipeline Overview Cards (Filterable) */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800">
            Pipeline Funnel Stages
          </h2>
          {selectedStage !== "ALL" && (
            <button
              onClick={() => setSelectedStage("ALL")}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              Reset Stage Filter
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {STATUSES.map((s) => {
            const isSelected = selectedStage === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setSelectedStage(isSelected ? "ALL" : s)}
                className={`p-3 rounded-lg text-center transition-all border text-left ${
                  isSelected
                    ? "bg-blue-50 border-blue-500 ring-2 ring-blue-500/20"
                    : "bg-slate-50 border-slate-200/80 hover:border-slate-300"
                }`}
              >
                <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase block mb-1 truncate">
                  {s}
                </span>
                <span className="text-xl font-extrabold text-slate-900">
                  {statusCounts[s] || 0}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Student Directory Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-800">
              Students Directory
            </h2>
            <p className="text-xs text-slate-400">
              Showing {filteredStudents.length} of {students.length} students
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search candidates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <button
              type="button"
              className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-slate-600 text-sm font-medium hover:bg-slate-50"
            >
              <Filter className="w-4 h-4" />
              Filter
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold uppercase text-slate-400 tracking-wider">
                <th className="py-3.5 px-6">Candidate Name</th>
                <th className="py-3.5 px-6">Email Address</th>
                <th className="py-3.5 px-6">Current Pipeline Stage</th>
                <th className="py-3.5 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-slate-400">
                    Loading directory...
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-slate-400">
                    No matching student records found.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="py-4 px-6 font-semibold text-slate-900">
                      {s.user?.name || s.name || "Unnamed"}
                    </td>
                    <td className="py-4 px-6 text-slate-500">
                      {s.user?.email || "N/A"}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getBadgeStyle(
                          s.status || "LEAD"
                        )}`}
                      >
                        {s.status || "LEAD"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          router.push(`/dashboard/admin/students/${s.id}`)
                        }
                        className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-medium text-xs hover:underline"
                      >
                        Manage Profile <ArrowUpRight className="w-3.5 h-3.5" />
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

function StatCard({ title, value, subtext, icon, iconBg }) {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </p>
        <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
        {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
      </div>
      {icon && <div className={`p-2.5 rounded-lg ${iconBg}`}>{icon}</div>}
    </div>
  );
}