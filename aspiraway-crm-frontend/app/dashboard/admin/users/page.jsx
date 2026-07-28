"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "STUDENT" });
  const [editId, setEditId] = useState(null);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) window.location.href = "/login";
    fetchAll();
  }, []);

  const fetchAll = async () => {
    const headers = { Authorization: `Bearer ${token}` };
    const usersRes = await axios.get("http://localhost:3001/admin/users", { headers });
    const statsRes = await axios.get("http://localhost:3001/admin/stats", { headers });
    setUsers(usersRes.data.users || []);
    setStats(statsRes.data || {});
  };

  const submit = async () => {
    const headers = { Authorization: `Bearer ${token}` };

    if (editId) {
      await axios.put(`http://localhost:3001/admin/users/${editId}`, form, { headers });
    } else {
      await axios.post("http://localhost:3001/admin/users", form, { headers });
    }

    setForm({ name: "", email: "", password: "", role: "STUDENT" });
    setEditId(null);
    fetchAll();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <div className="flex gap-4 mt-4">
        <div>Users: {stats.users}</div>
        <div>Students: {stats.students}</div>
        <div>Mentors: {stats.mentors}</div>
        <div>Applications: {stats.applications}</div>
      </div>

      <h2 className="mt-6 font-semibold">Manage Users</h2>

      <div className="flex gap-2 mt-2">
        <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        <input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        <input placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
        <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
          <option>ADMIN</option>
          <option>MENTOR</option>
          <option>STUDENT</option>
        </select>
        <button onClick={submit}>{editId ? "Update" : "Add"}</button>
      </div>

      <table className="w-full mt-4 border">
        <thead>
          <tr>
            <th>Name</th><th>Email</th><th>Role</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>
                <button onClick={() => { setForm(u); setEditId(u.id); }}>Edit</button>
                <button onClick={() => axios.delete(`http://localhost:3001/admin/users/${u.id}`, {
                  headers: { Authorization: `Bearer ${token}` }
                }).then(fetchAll)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
