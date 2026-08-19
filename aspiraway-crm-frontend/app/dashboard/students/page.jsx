"use client";
import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminStudents() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:3001/api/students", {
        headers: { Authorization: `Bearer ${localStorage.token}` },
      })
      .then((res) => setStudents(res.data));
  }, []);

  return (
    <div>
      <h1>Students</h1>
      {students.map((s) => (
        <div key={s.id}>
          <b>{s.user.name}</b> — {s.status}
        </div>
      ))}
    </div>
  );
}
