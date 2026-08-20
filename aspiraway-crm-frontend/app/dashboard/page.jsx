'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    api.get('/student/readiness')
      .then((res) => {
        if (isMounted) {
          setData(res.data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load readiness status:', err);
        if (isMounted) {
          setError('Unable to load dashboard details. Please try again.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="flex items-center gap-2 text-slate-400 font-medium">
          <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
          Loading dashboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl max-w-md m-6">
        <p className="font-medium text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4 font-sans text-slate-100">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <span>🎓</span> Student Dashboard
      </h1>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3 shadow-sm">
        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
          <span className="text-slate-400 text-sm">Status</span>
          <span className="font-semibold text-slate-200">{data?.status || 'N/A'}</span>
        </div>

        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
          <span className="text-slate-400 text-sm">Readiness Score</span>
          <span className="font-semibold text-indigo-400">{data?.readinessScore ?? 'N/A'}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-slate-400 text-sm">Visa Ready</span>
          <span className="font-semibold">
            {data?.visaReady ? 'Yes ✅' : 'No ❌'}
          </span>
        </div>
      </div>
    </div>
  );
}