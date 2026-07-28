"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter, useParams } from "next/navigation";

export default function EditStudentPage() {
  const { id } = useParams();
  const router = useRouter();
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    country: "",
    intake: "",
  });

  useEffect(() => {
    axios
      .get(`http://localhost:3001/api/students/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setForm(res.data.student))
      .catch(console.error);
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    await axios.put(
      `http://localhost:3001/api/students/${id}`,
      form,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    router.push("/dashboard/admin");
  };

  return (
    <form onSubmit={submit} className="max-w-lg space-y-4">
      {Object.keys(form).map((k) => (
        <input
          key={k}
          value={form[k] || ""}
          onChange={(e) => setForm({ ...form, [k]: e.target.value })}
          className="border p-2 w-full"
          placeholder={k}
        />
      ))}
      <button className="bg-black text-white px-4 py-2">Update</button>
    </form>
  );
}
