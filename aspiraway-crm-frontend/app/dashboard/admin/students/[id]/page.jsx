"use client";

import { useEffect, useState, use } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, Mail, Shield, Calendar } from "lucide-react";

export default function StudentDetailPage({ params }) {
  // Unwrap dynamic params in Next.js App Router
  const resolvedParams = use(params);
  const studentId = resolvedParams.id;

  const router = useRouter();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="flex items-center gap-3 text-slate-500 font-medium text-sm">
          <svg className="animate-spin h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading student profile...
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="p-8 bg-slate-50 min-h-screen font-sans">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-6 font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium">
          {error || "Student profile not found."}
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
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center font-bold text-2xl border border-blue-200">
            {student.user?.name?.charAt(0) || "S"}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{student.user?.name}</h1>
            <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
              <Mail className="w-3.5 h-3.5 text-slate-400" /> {student.user?.email}
            </p>
          </div>
        </div>

        <div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
            {student.status || "LEAD"}
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
              <span className="font-mono text-slate-800 text-xs">{student.id}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Current Pipeline Status:</span>
              <span className="font-semibold text-slate-800">{student.status || "LEAD"}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Role:</span>
              <span className="font-semibold text-slate-800">{student.user?.role || "STUDENT"}</span>
            </div>
          </div>
        </div>

        {/* System Details */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">
            Counseling Workflow
          </h2>
          <p className="text-xs text-slate-500">
            Assigned counselor and specific pipeline stages can be updated here as student applications progress.
          </p>
        </div>
      </div>
    </div>
  );
}