'use client';

import { useEffect, useState } from 'react';
import api from '../../lib/api';

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    // Prevent execution during server-side build phase
    if (typeof window === 'undefined') return;

    api.get('/student/readiness')
      .then((res) => {
        if (isMounted) {
          setData(res.data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load readiness data:', err);
        if (isMounted) {
          setError('Failed to load dashboard data.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <p style={{ color: 'red' }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>🎓 Student Dashboard</h1>
      <p>Status: <b>{data?.status || 'N/A'}</b></p>
      <p>Readiness Score: <b>{data?.readinessScore ?? 'N/A'}</b></p>
      <p>Visa Ready: <b>{data?.visaReady ? 'Yes ✅' : 'No ❌'}</b></p>
    </div>
  );
}