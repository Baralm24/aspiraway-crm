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
      // Use 127.0.0.1 instead of localhost to prevent IPv6 loopback errors
   const res = await axios.post(
  "/api/auth/login",
  { email, password },
  { headers: { "Content-Type": "application/json" } }
);

      // Store auth credentials on successful login
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      router.push("/dashboard/admin");
    } catch (err) {
      console.error("LOGIN ERROR:", err?.response?.data || err.message);

      // Display detailed server response or default error message
      const apiErrorMessage = err?.response?.data?.error;
      if (apiErrorMessage) {
        setError(apiErrorMessage);
      } else if (err.message === "Network Error") {
        setError("Unable to connect to the backend server. Please check if it is running.");
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
            {error}
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
          style={{ width: "100%", padding: 10, cursor: loading ? "not-allowed" : "pointer" }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}