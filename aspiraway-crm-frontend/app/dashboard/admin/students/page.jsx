"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    axios
      .get("http://localhost:3001/api/students", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setStudents(res.data.students || []);
      })
      .catch((err) => {
        console.error("FETCH STUDENTS ERROR:", err);
        setError("Failed to load students");
        setStudents([]);
      });
  }, []);

  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Students</h1>

      {students.length === 0 && <p>No students found.</p>}

      {students.map((s) => (
        <div
          key={s.id}
          className="border p-3 mb-2 rounded bg-white shadow"
        >
          <b>{s.user?.name}</b> — {s.studentProfile?.status || "LEAD"}
        </div>
      ))}
    </div>
  );
}
