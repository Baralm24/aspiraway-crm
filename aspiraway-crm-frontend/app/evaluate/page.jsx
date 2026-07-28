'use client';

import { useState, useEffect } from 'react';

export default function EvaluatePage() {
  // Input Config State
  const [targetUniversity, setTargetUniversity] = useState('');
  const [targetCourse, setTargetCourse] = useState('');

  // Flow State
  const [isStarted, setIsStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Questions State
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);

  // 1. Fetch Dynamic Questions from Backend
  const handleStartSession = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          universitySlug: targetUniversity.trim().toLowerCase() || 'general',
          courseTitle: targetCourse.trim() || 'General Course',
        }),
      });

      const data = await response.json();
      console.log('Fetched Questions Data:', data);

      if (response.ok && data.questions && data.questions.length > 0) {
        // Normalize fields coming from database or API generator
        const formattedQuestions = data.questions.map((q) => ({
          category: q.category || q.type || q.section || 'STUDY PLAN',
          text: q.text || q.prompt || q.question || q.title || 'No question prompt available',
          timeLimit: q.timeLimit || q.time || 60,
        }));

        setQuestions(formattedQuestions);
        setCurrentIndex(0);
        setIsStarted(true);
        setTimeLeft(formattedQuestions[0]?.timeLimit || 60);
      } else {
        setErrorMessage(
          data.error || 'Failed to fetch dynamic questions. Please verify database connection.'
        );
      }
    } catch (err) {
      console.error('Error initiating session:', err);
      setErrorMessage('Network error while connecting to the question generator.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Countdown Timer Logic
  useEffect(() => {
    if (!isStarted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isStarted, timeLeft]);

  // 3. Navigation Controls
  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setTimeLeft(questions[nextIdx]?.timeLimit || 60);
    } else {
      alert('Mock Interview Completed!');
    }
  };

  const currentQuestion = questions[currentIndex];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-6">
      {/* Header */}
      <header className="w-full max-w-4xl flex justify-between items-center py-4 mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-900 text-white font-bold p-2 rounded">A</div>
          <div>
            <h1 className="font-bold text-lg text-indigo-950">Aspiraway</h1>
            <p className="text-xs text-slate-500">Study Abroad, Peer to Peer</p>
          </div>
        </div>
        <span className="bg-indigo-900 text-white text-xs px-3 py-1 rounded-full font-semibold">
          UK · SEPTEMBER 2026 INTAKE
        </span>
      </header>

      {/* VIEW 1: CONFIG FORM (SETUP) */}
      {!isStarted ? (
        <main className="w-full max-w-3xl bg-white rounded-2xl shadow-sm p-8 mt-4 border border-slate-100">
          <h2 className="text-3xl font-extrabold text-indigo-950 mb-2">Pre-CAS Mock Interview</h2>
          <p className="text-slate-600 mb-8">
            Rehearse genuine student credibility questions under timed pressure. Receive structured AI feedback.
          </p>

          <form onSubmit={handleStartSession} className="space-y-6">
            <div className="bg-slate-50/50 p-6 rounded-xl border border-slate-100 space-y-4">
              <h3 className="font-semibold text-slate-800 text-sm">Session Config</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-indigo-900 uppercase mb-1">
                    TARGET UNIVERSITY
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. University of Greenwich"
                    value={targetUniversity}
                    onChange={(e) => setTargetUniversity(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-indigo-900 uppercase mb-1">
                    TARGET COURSE
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MSc Data Science"
                    value={targetCourse}
                    onChange={(e) => setTargetCourse(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    required
                  />
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 flex items-center space-x-2">
                <span>ℹ️</span>
                <p><strong>Context:</strong> Assessed under the Genuine Student requirement and updated sponsor RAG risk ratings.</p>
              </div>
            </div>

            {errorMessage && (
              <p className="text-red-500 text-sm font-medium text-center">{errorMessage}</p>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-indigo-900 text-white font-semibold px-6 py-3 rounded-lg hover:bg-indigo-800 transition disabled:opacity-50"
              >
                {isLoading ? 'Generating Interview...' : 'Start Practice Session →'}
              </button>
            </div>
          </form>
        </main>
      ) : (
        /* VIEW 2: DYNAMIC INTERVIEW ENGINE */
        <main className="w-full max-w-3xl bg-white rounded-2xl shadow-sm p-8 mt-4 border border-slate-100">
          {/* Dynamic Badge & Question Index */}
          <div className="mb-4">
            <span className="bg-indigo-950 text-white text-xs uppercase font-bold tracking-wider px-3 py-1.5 rounded-full">
              {currentQuestion?.category} (QUESTION {currentIndex + 1} OF {questions.length})
            </span>
          </div>

          {/* Dynamic Question Text */}
          <h2 className="text-2xl font-bold text-indigo-950 mb-8 leading-snug">
            {currentQuestion?.text}
          </h2>

          {/* Countdown Clock */}
          <div className="flex justify-center my-6">
            <div className="w-24 h-24 rounded-full border-4 border-indigo-900 flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-indigo-950">{timeLeft}</span>
              <span className="text-[10px] tracking-widest text-slate-400 font-bold uppercase">SPEAK</span>
            </div>
          </div>

          {/* Video & Live Recording Box */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
            <div className="bg-slate-900 rounded-lg aspect-video md:aspect-square flex items-center justify-center text-slate-400 text-xs relative overflow-hidden">
              <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span> REC
              </span>
              Camera Preview
            </div>

            <div className="md:col-span-2 bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase mb-2">SPOKEN ANSWER (LIVE TRANSCRIPT)</p>
                <p className="text-slate-400 italic text-sm">Listening to your speech...</p>
              </div>
              <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-4">
                🎙️ Live Recording
              </p>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-end mt-6">
            <button
              onClick={handleNextQuestion}
              className="bg-amber-400 hover:bg-amber-500 text-indigo-950 font-bold px-6 py-3 rounded-lg transition"
            >
              Finish Answer Early →
            </button>
          </div>
        </main>
      )}

      <footer className="mt-8 text-center text-xs text-slate-400 max-w-2xl">
        Practice tool for UK pre-CAS credibility interview prep. Feedback is AI-generated to help you rehearse structure and content — it is not an official assessment and does not represent any university's decision.
      </footer>
    </div>
  );
}