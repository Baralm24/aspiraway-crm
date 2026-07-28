"use client";
import { useEffect, useState } from "react";
import axios from "axios";

export default function MentorsPage() {
  const [mentors, setMentors] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get("http://localhost:3001/api/mentors", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setMentors(res.data || []));
  }, []);

  return (
    <div className="p-10 bg-gray-50 min-h-screen space-y-8">
      <h1 className="text-3xl font-bold">Mentors</h1>

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Mentor</th>
              <th>Email</th>
              <th>Expertise</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {mentors.map((m) => (
              <tr key={m.id} className="border-t">
                <td className="p-3 font-medium">{m.user.name}</td>
                <td>{m.user.email}</td>
                <td>{m.expertise || "—"}</td>
                <td>
                  {m.isActive ? (
                    <span className="text-green-600 font-semibold">Active</span>
                  ) : (
                    <span className="text-red-500 font-semibold">Inactive</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
