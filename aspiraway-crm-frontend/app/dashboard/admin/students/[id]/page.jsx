"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";

const STATUSES = ["LEAD", "COUNSELING", "SHORTLISTING", "SOP", "APPLIED", "OFFER", "VISA", "DEPARTED"];

export default function StudentProfile() {
  const { id } = useParams();
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

  const [student, setStudent] = useState(null);
  const [status, setStatus] = useState("");
  const [phone, setPhone] = useState("");
  const [countryPreference, setCountryPreference] = useState("");
  const [intake, setIntake] = useState("");

  const [mentors, setMentors] = useState([]);
  const [selectedMentor, setSelectedMentor] = useState("");
  const [appUniversity, setAppUniversity] = useState("");
  const [appCountry, setAppCountry] = useState("");
  const [followUpNote, setFollowUpNote] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const studentRes = await axios.get(`http://localhost:3001/api/students/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const s = studentRes.data;
        setStudent(s);
        setStatus(s.status);
        setPhone(s.phone);
        setCountryPreference(s.countryPreference);
        setIntake(s.intake);

        const mentorRes = await axios.get("http://localhost:3001/api/mentors", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMentors(mentorRes.data);
        setSelectedMentor(s.mentorId || "");
      } catch (err) {
        console.error("FETCH STUDENT ERROR:", err.response?.data || err.message);
      }
    }
    fetchData();
  }, [id]);

  if (!student) return <div className="p-10">Loading...</div>;

  const updateStatus = async () => {
    await axios.patch(
      `http://localhost:3001/api/students/${id}/status`,
      { status },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    alert("Status updated");
    setStudent({ ...student, status });
  };

  const saveProfile = async () => {
    await axios.patch(
      `http://localhost:3001/api/students/${id}/profile`,
      { phone, countryPreference, intake },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    alert("Profile saved");
    setStudent({ ...student, phone, countryPreference, intake });
  };

  const assignMentor = async () => {
    await axios.patch(
      `http://localhost:3001/api/students/${id}/assign-mentor`,
      { mentorId: selectedMentor },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    alert("Mentor assigned");
    setStudent({ ...student, mentorId: selectedMentor });
  };

  const addApplication = async () => {
    const res = await axios.post(
      `http://localhost:3001/api/students/${id}/applications`,
      { university: appUniversity, country: appCountry },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    alert("Application added");
    setStudent({ ...student, applications: [res.data, ...student.applications] });
    setAppUniversity("");
    setAppCountry("");
  };

  const addFollowUp = async () => {
    const res = await axios.post(
      `http://localhost:3001/api/students/${id}/followups`,
      { note: followUpNote },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    alert("Follow-up added");
    setStudent({ ...student, followUps: [res.data, ...student.followUps] });
    setFollowUpNote("");
  };

  return (
    <div className="p-10 bg-gray-50 min-h-screen space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{student.user.name}</h1>
        <p className="text-gray-500">{student.user.email}</p>
      </div>

      {/* Profile Info */}
      <div className="bg-white p-6 rounded shadow space-y-4">
        <h2 className="text-xl font-semibold">Profile Info</h2>
        <Input label="Phone" value={phone} onChange={setPhone} />
        <Input label="Country Preference" value={countryPreference} onChange={setCountryPreference} />
        <Input label="Intake" value={intake} onChange={setIntake} />
        <button onClick={saveProfile} className="bg-black text-white px-4 py-2 rounded">Save Profile</button>
      </div>

      {/* Pipeline Status */}
      <div className="bg-white p-6 rounded shadow space-y-4">
        <h2 className="text-xl font-semibold">Pipeline Status</h2>
        <div className="flex gap-4">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="border p-2 rounded">
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button onClick={updateStatus} className="bg-black text-white px-4 py-2 rounded">Update Status</button>
        </div>
      </div>

      {/* Mentor Assignment */}
      <div className="bg-white p-6 rounded shadow space-y-4">
        <h2 className="text-xl font-semibold">Assign Mentor</h2>
        <div className="flex gap-4">
          <select value={selectedMentor} onChange={(e) => setSelectedMentor(e.target.value)} className="border p-2 rounded w-full">
            <option value="">-- Select Mentor --</option>
            {mentors.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <button onClick={assignMentor} className="bg-black text-white px-4 py-2 rounded">Assign</button>
        </div>
      </div>

      {/* Applications */}
      <div className="bg-white p-6 rounded shadow space-y-4">
        <h2 className="text-xl font-semibold">Applications</h2>
        <div className="flex gap-2">
          <input placeholder="University" value={appUniversity} onChange={e => setAppUniversity(e.target.value)} className="border p-2 rounded w-full"/>
          <input placeholder="Country" value={appCountry} onChange={e => setAppCountry(e.target.value)} className="border p-2 rounded w-full"/>
          <button onClick={addApplication} className="bg-black text-white px-4 py-2 rounded">Add</button>
        </div>
        <ul className="list-disc pl-5">
          {student.applications.map((a) => <li key={a.id}>{a.university} ({a.country})</li>)}
        </ul>
      </div>

      {/* Follow-ups */}
      <div className="bg-white p-6 rounded shadow space-y-4">
        <h2 className="text-xl font-semibold">Follow-ups</h2>
        <div className="flex gap-2">
          <input placeholder="Follow-up note" value={followUpNote} onChange={e => setFollowUpNote(e.target.value)} className="border p-2 rounded w-full"/>
          <button onClick={addFollowUp} className="bg-black text-white px-4 py-2 rounded">Add</button>
        </div>
        <ul className="list-disc pl-5">
          {student.followUps.map((f) => <li key={f.id}>{f.note}</li>)}
        </ul>
      </div>
    </div>
  );
}

function Input({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-sm text-gray-500 mb-1">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="border p-2 rounded w-full" />
    </div>
  );
}
