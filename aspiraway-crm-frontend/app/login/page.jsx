"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Direct call to Render backend (bypasses missing Next.js rewrites)
      const res = await axios.post(
        "https://aspiraway-crm.onrender.com/api/auth/login",
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );

      // Store auth credentials on successful login
      if (res.data?.token) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        router.push("/dashboard/admin");
      }
    } catch (err) {
      console.error("LOGIN ERROR:", err);

      // Safely extract string error messages only to avoid React Object rendering crash
      const apiErrorMessage = err?.response?.data?.error;
      
      if (typeof apiErrorMessage === "string") {
        setError(apiErrorMessage);
      } else if (err.code === "ERR_NETWORK" || err.message === "Network Error") {
        setError("Unable to connect to the backend server. Please check your connection.");
      } else {
        setError("Invalid email or password");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <form
        onSubmit={handleLogin}
        style={{
          width: 320,
          padding: 24,
          border: "1px solid #ddd",
          borderRadius: 8,
        }}
      >
        <h2 style={{ marginBottom: 16 }}>Admin Login</h2>

        {error && (
          <p style={{ color: "red", marginBottom: 12, fontSize: "14px" }}>
            {String(error)}
          </p>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: "100%", marginBottom: 12, padding: 8 }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: "100%", marginBottom: 12, padding: 8 }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: 10,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}