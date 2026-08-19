"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";

export default function FollowupsPage() {
  const { id } = useParams();
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

  const [followups, setFollowups] = useState([]);
  const [form, setForm] = useState({ mentorId: "", note: "", followUpDate: "", nextFollowUpDate: "" });
  const [mentors, setMentors] = useState([]);

  const fetchFollowups = async () => {
    try {
      const res = await axios.get(`http://localhost:3001/api/students/${id}/followups`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFollowups(res.data);
    } catch (err) {
      console.error("FETCH FOLLOWUPS ERROR:", err);
    }
  };

  const fetchMentors = async () => {
    try {
      const res = await axios.get(`http://localhost:3001/api/mentors`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMentors(res.data);
    } catch (err) {
      console.error("FETCH MENTORS ERROR:", err);
    }
  };

  useEffect(() => {
    fetchFollowups();
    fetchMentors();
  }, [id]);

  const addFollowup = async () => {
    try {
      await axios.post(`http://localhost:3001/api/students/${id}/followups`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setForm({ mentorId: "", note: "", followUpDate: "", nextFollowUpDate: "" });
      fetchFollowups();
    } catch (err) {
      console.error("ADD FOLLOWUP ERROR:", err);
    }
  };

  return (
    <div className="p-10 space-y-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold">Follow-Up Timeline</h1>

      <div className="bg-white p-6 rounded shadow space-y-4">
        <h2 className="font-semibold text-lg">Add New Follow-Up</h2>
        <select className="border p-2 rounded w-full" value={form.mentorId} onChange={(e) => setForm({ ...form, mentorId: e.target.value })}>
          <option value="">Select Mentor</option>
          {mentors.map((m) => <option key={m.id} value={m.id}>{m.user.name}</option>)}
        </select>
        <Input label="Note" value={form.note} onChange={(v) => setForm({ ...form, note: v })} />
        <Input label="Follow-Up Date" type="date" value={form.followUpDate} onChange={(v) => setForm({ ...form, followUpDate: v })} />
        <Input label="Next Follow-Up Date" type="date" value={form.nextFollowUpDate} onChange={(v) => setForm({ ...form, nextFollowUpDate: v })} />
        <button onClick={addFollowup} className="bg-black text-white px-4 py-2 rounded">Add Follow-Up</button>
      </div>

      <div className="bg-white p-6 rounded shadow space-y-2">
        <h2 className="font-semibold text-lg">Follow-Up Timeline</h2>
        {followups.length === 0 && <p className="text-gray-500">No follow-ups yet.</p>}
        {followups.map((fu) => (
          <div key={fu.id} className="border-b py-2">
            <p><span className="font-semibold">{fu.mentor.user.name}</span>: {fu.note}</p>
            <p className="text-gray-500 text-sm">
              Follow-Up: {new Date(fu.followUpDate).toLocaleDateString()} | Next: {fu.nextFollowUpDate ? new Date(fu.nextFollowUpDate).toLocaleDateString() : "-"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text" }) {
  return (
    <div className="mt-2">
      <label className="block text-sm text-gray-500 mb-1">{label}</label>
      <input type={type} className="border p-2 rounded w-full" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
