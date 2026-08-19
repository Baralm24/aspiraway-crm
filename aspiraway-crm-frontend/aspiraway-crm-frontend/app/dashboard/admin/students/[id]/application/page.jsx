"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";

export default function ApplicationsPage() {
  const { id } = useParams();
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

  const [applications, setApplications] = useState([]);
  const [form, setForm] = useState({ universityName: "", country: "", program: "", intake: "" });

  const fetchApplications = async () => {
    try {
      const res = await axios.get(`http://localhost:3001/api/students/${id}/applications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setApplications(res.data);
    } catch (err) {
      console.error("FETCH APPLICATIONS ERROR:", err);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [id]);

  const addApplication = async () => {
    try {
      await axios.post(`http://localhost:3001/api/students/${id}/applications`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setForm({ universityName: "", country: "", program: "", intake: "" });
      fetchApplications();
    } catch (err) {
      console.error("ADD APPLICATION ERROR:", err);
    }
  };

  const deleteApplication = async (appId) => {
    try {
      await axios.delete(`http://localhost:3001/api/applications/${appId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchApplications();
    } catch (err) {
      console.error("DELETE APPLICATION ERROR:", err);
    }
  };

  return (
    <div className="p-10 space-y-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold">Applications</h1>

      <div className="bg-white p-6 rounded shadow space-y-4">
        <h2 className="font-semibold text-lg">Add New Application</h2>
        <Input label="University Name" value={form.universityName} onChange={(v) => setForm({ ...form, universityName: v })} />
        <Input label="Country" value={form.country} onChange={(v) => setForm({ ...form, country: v })} />
        <Input label="Program" value={form.program} onChange={(v) => setForm({ ...form, program: v })} />
        <Input label="Intake" value={form.intake} onChange={(v) => setForm({ ...form, intake: v })} />
        <button onClick={addApplication} className="bg-black text-white px-4 py-2 rounded">Add Application</button>
      </div>

      <div className="bg-white p-6 rounded shadow space-y-2">
        <h2 className="font-semibold text-lg">Existing Applications</h2>
        {applications.length === 0 && <p className="text-gray-500">No applications yet.</p>}
        {applications.map((app) => (
          <div key={app.id} className="flex justify-between items-center border-b py-2">
            <div>
              <p className="font-medium">{app.universityName}</p>
              <p className="text-gray-500">{app.country} - {app.program} ({app.intake})</p>
            </div>
            <button onClick={() => deleteApplication(app.id)} className="text-red-600">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Input({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-sm text-gray-500 mb-1">{label}</label>
      <input
        className="border p-2 rounded w-full"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
