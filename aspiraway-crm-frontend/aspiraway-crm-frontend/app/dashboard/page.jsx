'use client';
import { useEffect, useState } from 'react';
import api from '../../lib/api';

export default function StudentDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/student/readiness').then(res => setData(res.data));
  }, []);

  if (!data) return <p>Loading...</p>;

  return (
    <div style={{ padding: 24 }}>
      <h1>🎓 Student Dashboard</h1>
      <p>Status: <b>{data.status}</b></p>
      <p>Readiness Score: <b>{data.readinessScore}</b></p>
      <p>Visa Ready: <b>{data.visaReady ? 'Yes ✅' : 'No ❌'}</b></p>
    </div>
  );
}