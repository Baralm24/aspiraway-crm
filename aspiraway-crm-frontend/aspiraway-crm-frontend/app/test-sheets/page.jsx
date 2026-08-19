"use client";

import { useState } from "react";

export default function TestSheetsPage() {
  const [status, setStatus] = useState("Idle");
  const [response, setResponse] = useState(null);

  const handleTestSubmit = async () => {
    alert("Button clicked! Sending request...");
    setStatus("Sending POST request to /api/session/create...");
    
    try {
      const res = await fetch("/api/session/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: "ASP-2026-EXPRESS01",
          mentorName: "Manish Baral",
          mentorEmail: "baralmanish123@gmail.com",
          studentName: "Test Student",
          studentEmail: "student@test.com",
          topic: "Express Sheet Test",
          scheduledTime: new Date().toISOString(),
          status: "Pending",
        }),
      });

      const data = await res.json();
      setStatus("Completed!");
      setResponse(data);
    } catch (err) {
      console.error("Fetch Error:", err);
      setStatus("Error: " + err.message);
      setResponse({ error: err.message });
    }
  };

  return (
    <div style={{ padding: 40, fontFamily: "sans-serif" }}>
      <h2>🧪 Google Sheets API Route Test</h2>
      <button 
        onClick={handleTestSubmit}
        style={{
          padding: "12px 24px",
          backgroundColor: "#0070f3",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        Trigger /api/session/create
      </button>

      <p><strong>Status:</strong> {status}</p>
      {response && (
        <pre style={{ background: "#f4f4f4", padding: 15, borderRadius: 5 }}>
          {JSON.stringify(response, null, 2)}
        </pre>
      )}
    </div>
  );
}