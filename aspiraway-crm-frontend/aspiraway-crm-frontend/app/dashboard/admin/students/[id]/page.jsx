"use client";

import { useEffect, useState, use } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, Save, CheckCircle2 } from "lucide-react";

export default function StudentDetailPage({ params }) {
  const resolvedParams = use(params);
  const studentId = resolvedParams.id;

  const router = useRouter();
  const [student, setStudent] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [error, setError] = useState("");

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
    async function fetchStudentDetails() {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await axios.get(
          `https://aspiraway-crm.onrender.com/api/students/${studentId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setStudent(res.data);
        setStatus(res.data.status || "LEAD");
      } catch (err) {
        console.error("FETCH STUDENT DETAILS ERROR:", err);
        setError("Failed to load student details.");
      } finally {
        setLoading(false);
      }
    }

    if (studentId) {
      fetchStudentDetails();
    }
  }, [studentId, router]);

  async function handleStatusUpdate() {
    setUpdating(true);
    setSuccessMsg("");
    setError("");

    try {
      const token = localStorage.getItem("token");
      const res = await axios.patch(
        `https://aspiraway-crm.onrender.com/api/students/${studentId}`,
        { status },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setStudent(res.data);
      setSuccessMsg("Status updated successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error("UPDATE STATUS ERROR:", err);
      setError("Failed to update status.");
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="flex items-center gap-3 text-slate-500 font-medium text-sm">
          <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full" />
          Loading student profile...
        </div>
      </div>
    );
  }

  if (error && !student) {
    return (
      <div className="p-8 bg-slate-50 min-h-screen font-sans">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-6 font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-slate-50 min-h-screen font-sans text-slate-900 space-y-6">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Students Directory
      </button>

      {/* Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center font-bold text-2xl border border-blue-200 uppercase">
            {student?.user?.name?.charAt(0) || "S"}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 capitalize">
              {student?.user?.name}
            </h1>
            <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
              <Mail className="w-3.5 h-3.5 text-slate-400" /> {student?.user?.email}
            </p>
          </div>
        </div>

        <div>
          <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
            {student?.status || "LEAD"}
          </span>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Overview */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">
            Profile Details
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Student ID:</span>
              <span className="font-mono text-slate-800 text-xs">{student?.id}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Current Pipeline Status:</span>
              <span className="font-semibold text-slate-800">{student?.status || "LEAD"}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Role:</span>
              <span className="font-semibold text-slate-800">{student?.user?.role || "STUDENT"}</span>
            </div>
          </div>
        </div>

        {/* Counseling Workflow & Pipeline Control */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">
            Counseling Workflow
          </h2>

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> {successMsg}
            </div>
          )}

          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Update Stage
            </label>
            <div className="flex gap-2">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              <button
                onClick={handleStatusUpdate}
                disabled={updating || status === student?.status}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-xs transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                <Save className="w-3.5 h-3.5" />
                {updating ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}