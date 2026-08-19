'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function EvaluatePage() {
  // --- States ---
  const [stage, setStage] = useState('CONFIG'); // 'CONFIG' | 'INTERVIEW' | 'COMPLETED'
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [phase, setPhase] = useState('PREP'); // 'PREP' | 'RECORDING'
  
  // Timer Settings (Seconds)
  const PREP_TIME = 30;
  const RECORD_TIME = 90;
  const [timeLeft, setTimeLeft] = useState(PREP_TIME);
  const timerRef = useRef(null);

  // Media & Transcript States
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);

  // Dynamic API URL for Mock AI Service
  const MOCK_API_BASE =
    process.env.NEXT_PUBLIC_MOCK_API_URL ||
    'https://aspiraway-mock-backend.onrender.com';

  // 1. Start Session & Fetch Dynamic Questions
  const handleStartSession = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${MOCK_API_BASE}/api/generate`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to generate questions');
      
      const data = await res.json();
      const loadedQuestions = data.questions || data || [];

      if (loadedQuestions.length > 0) {
        setQuestions(loadedQuestions);
      } else {
        // Fallback standard credibility questions
        setQuestions([
          { category: "STUDY PLAN", text: "Why did you choose this specific course and university in the UK?" },
          { category: "FINANCES", text: "How are you funding your studies and living expenses in the UK?" },
        ]);
      }

      setStage('INTERVIEW');
      setupWebcam();
    } catch (err) {
      console.error('Error starting session:', err);
      // Fallback questions if backend call encounters network issues
      setQuestions([
        { category: "STUDY PLAN", text: "Why did you choose this specific course and university in the UK?" }
      ]);
      setStage('INTERVIEW');
      setupWebcam();
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Initialize Webcam Feed
  const setupWebcam = async () => {
    try {
      if (typeof window === 'undefined' || !navigator?.mediaDevices) return;
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = mediaStream;
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.warn('Webcam/Microphone access denied or unavailable:', err);
    }
  };

  // Clean up media stream and speech recognition on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  // 3. Speech Recognition Engine
  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognitionRef.current.onerror = (err) => {
        console.error('Speech recognition error:', err);
      };
    }
  }, []);

  // Manage Speech Recognition lifecycle based on interview phase
  useEffect(() => {
    if (phase === 'RECORDING' && recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        // Recognition might already be running
      }
    } else if (phase === 'PREP' && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Engine stopped
      }
    }
  }, [phase]);

  // 4. Timer Loop Logic
  useEffect(() => {
    if (stage !== 'INTERVIEW') return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev > 1) return prev - 1;

        if (phase === 'PREP') {
          setPhase('RECORDING');
          return RECORD_TIME;
        }

        if (phase === 'RECORDING') {
          handleNextQuestion();
          return PREP_TIME;
        }

        return 0;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [stage, phase, currentIndex, questions]);

  // 5. Skip Prep Handler
  const handleSkipPrep = () => {
    if (phase === 'PREP') {
      clearInterval(timerRef.current);
      setPhase('RECORDING');
      setTimeLeft(RECORD_TIME);
    }
  };

  // 6. Next Question Handler
  const handleNextQuestion = () => {
    clearInterval(timerRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setPhase('PREP');
      setTimeLeft(PREP_TIME);
      setTranscript('');
    } else {
      setStage('COMPLETED');
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    }
  };

  // SVG Circular Math Calculations
  const maxTime = phase === 'PREP' ? PREP_TIME : RECORD_TIME;
  const strokeDashoffset = 283 - (283 * timeLeft) / maxTime;

  const currentQuestionObj = questions[currentIndex];
  const questionText = typeof currentQuestionObj === 'string'
    ? currentQuestionObj
    : currentQuestionObj?.text || currentQuestionObj?.question || '';
  const categoryText = currentQuestionObj?.category || 'CREDIBILITY ASSESSMENT';

  // --- STAGE 1: SESSION CONFIG ---
  if (stage === 'CONFIG') {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 font-sans">
        <div className="max-w-xl w-full bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-indigo-400">Aspiraway</h1>
            <span className="text-xs bg-indigo-950 text-indigo-300 border border-indigo-800 px-3 py-1 rounded-full font-medium">
              UK · September 2026 Intake
            </span>
          </div>
          <h2 className="text-xl font-semibold mb-2">Pre-CAS Mock Interview</h2>
          <p className="text-slate-400 text-sm mb-6">
            Rehearse genuine student credibility questions under timed pressure. Receive structured AI feedback.
          </p>
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/50 mb-8 text-xs text-slate-300">
            🛈 <b>Context:</b> Assessed under the Genuine Student requirement and updated sponsor RAG risk ratings.
          </div>
          <button
            onClick={handleStartSession}
            disabled={isLoading}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 font-semibold rounded-xl transition flex items-center justify-center gap-2 text-white disabled:opacity-50 shadow-md"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating Dynamic Questions...
              </>
            ) : (
              'Start Mock Interview Session →'
            )}
          </button>
        </div>
      </div>
    );
  }

  // --- STAGE 2: COMPLETED ---
  if (stage === 'COMPLETED') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-full mb-6 text-emerald-400">
          <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold mb-2">Interview Completed!</h1>
        <p className="text-slate-400 max-w-md mb-8">
          You completed all {questions.length} questions under real prep and response timer rules.
        </p>
        <button
          onClick={() => {
            setStage('CONFIG');
            setCurrentIndex(0);
            setPhase('PREP');
            setTimeLeft(PREP_TIME);
            setTranscript('');
          }}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition shadow-md"
        >
          Start New Session
        </button>
      </div>
    );
  }

  // --- STAGE 3: INTERVIEW SCREEN ---
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6 md:p-10 font-sans">
      {/* Header */}
      <header className="flex justify-between items-center max-w-5xl mx-auto w-full mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white">A</div>
          <span className="font-semibold text-slate-200">Aspiraway</span>
        </div>
        <span className="text-xs bg-indigo-950 text-indigo-300 border border-indigo-800/60 px-3 py-1 rounded-full font-medium tracking-wide">
          UK · SEPTEMBER 2026 INTAKE
        </span>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl my-auto">
        {/* Dynamic Category & Question Counter */}
        <div className="inline-block bg-indigo-950/80 border border-indigo-800/50 px-3 py-1 rounded-full text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-6">
          {categoryText} (QUESTION {currentIndex + 1} OF {questions.length})
        </div>

        {/* Dynamic Question Text */}
        <h1 className="text-xl md:text-2xl font-semibold leading-relaxed text-slate-100 mb-8">
          {questionText}
        </h1>

        {/* Dynamic Circular Timer */}
        <div className="relative w-40 h-40 mx-auto mb-8 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" className="text-slate-800" strokeWidth="6" stroke="currentColor" fill="transparent" />
            <circle
              cx="50"
              cy="50"
              r="45"
              className={`transition-all duration-1000 ease-linear ${
                phase === 'PREP' ? 'text-amber-400' : 'text-indigo-500'
              }`}
              strokeWidth="6"
              strokeDasharray="283"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-3xl font-bold tracking-tight text-white">{timeLeft}</span>
            <span className="text-[10px] uppercase tracking-widest text-slate-400 mt-1 font-semibold">
              {phase === 'PREP' ? 'THINK' : 'SPEAK'}
            </span>
          </div>
        </div>

        {/* Control Button */}
        <div className="flex justify-center mb-8">
          {phase === 'PREP' ? (
            <button
              onClick={handleSkipPrep}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-lg shadow-md transition text-sm"
            >
              Skip Prep & Answer →
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-md transition text-sm"
            >
              Submit Answer & Next →
            </button>
          )}
        </div>

        {/* Media / Live Output Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-800 pt-6">
          {/* Webcam Box */}
          <div className="md:col-span-1 bg-slate-950 rounded-xl overflow-hidden border border-slate-800 relative aspect-video flex items-center justify-center">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform -scale-x-100" />
            <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur px-2 py-0.5 rounded text-[10px] text-slate-300">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Camera Active
            </div>
          </div>

          {/* Live Transcript Box */}
          <div className="md:col-span-2 bg-slate-950 rounded-xl p-4 border border-slate-800 flex flex-col justify-between min-h-[120px]">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2 flex items-center justify-between">
                <span>Spoken Answer (Live Transcript)</span>
                {phase === 'RECORDING' && (
                  <span className="text-xs text-red-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" /> Recording
                  </span>
                )}
              </span>
              <p className="text-sm text-slate-300 italic leading-relaxed">
                {phase === 'PREP'
                  ? 'Get ready to speak when the timer turns blue...'
                  : transcript || 'Listening to microphone... Speak clearly.'}
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="text-center text-xs text-slate-500 max-w-xl mx-auto mt-4">
        Practice tool for UK pre-CAS credibility interview prep. Feedback is AI-generated to help you rehearse structure and content.
      </footer>
    </div>
  );
}