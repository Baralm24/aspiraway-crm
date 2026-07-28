'use client';

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Video, VideoOff, Mic, MicOff, Play, Pause, CheckCircle2,
  Clock, AlertCircle, RefreshCw, ChevronRight, Loader2,
  ThumbsUp, TrendingUp, Lightbulb, ShieldAlert, Sparkles, Activity, Shuffle
} from 'lucide-react';

// Aspiraway Brand Tokens
const BRAND = {
  navy: '#0A0A87',
  navyDeep: '#060650',
  gold: '#FEC72F',
  goldSoft: '#FFF8E6',
  paper: '#F8F9FC',
  ink: '#0F172A',
  inkSoft: '#475569',
  border: '#E2E8F0',
  green: '#10B981',
  greenSoft: '#ECFDF5',
  amber: '#F59E0B',
  amberSoft: '#FFFBEB',
  red: '#EF4444',
  redSoft: '#FEF2F2',
};

// Master Question Pool (categorized with dynamic tags)
const MASTER_QUESTION_POOL = [
  { id: 1, category: 'Introduction', title: 'Tell us about yourself and why you chose to study in the UK.', seconds: 90 },
  { id: 2, category: 'Academic Background', title: 'How does your previous qualification prepare you for {course}?', seconds: 90 },
  { id: 3, category: 'University Choice', title: 'Why did you choose {university} over other universities offering {course}?', seconds: 90 },
  { id: 4, category: 'Course Modules', title: 'Which specific modules in {course} are you most interested in and why?', seconds: 90 },
  { id: 5, category: 'Financial Genuineness', title: 'Who is sponsoring your education, and how was this funding accumulated?', seconds: 90 },
  { id: 6, category: 'Career Goals', title: 'What specific career role will you pursue after completing {course} at {university}?', seconds: 90 },
  { id: 7, category: 'Ties to Home Country', title: 'Why do you plan to return home after your studies rather than stay in the UK?', seconds: 90 },
  { id: 8, category: 'Accommodation & Living', title: 'Where do you plan to live while studying at {university}, and what are the expected costs?', seconds: 90 },
  { id: 9, category: 'Gap Year Explanation', title: 'Can you explain any gaps in your education or work history prior to applying for {course}?', seconds: 90 },
];

// Utility to shuffle and pick N random items
function getRandomQuestions(university, course, count = 5) {
  const targetUni = university || 'your chosen university';
  const targetCourse = course || 'your chosen course';

  // Replace placeholders with dynamic context
  const customizedPool = MASTER_QUESTION_POOL.map((q) => ({
    ...q,
    title: q.title.replace(/{university}/g, targetUni).replace(/{course}/g, targetCourse),
  }));

  // Fisher-Yates Shuffle
  const shuffled = [...customizedPool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, count);
}

function EvaluateContent() {
  const searchParams = useSearchParams();

  // Dynamic session context
  const universityParam = searchParams.get('university') || '';
  const courseParam = searchParams.get('course') || '';

  const [questions, setQuestions] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);

  // Initialize shuffled questions on mount
  useEffect(() => {
    const uni = universityParam || localStorage.getItem('target_university') || 'University of Greenwich';
    const crs = courseParam || localStorage.getItem('target_course') || 'MSc Data Science';

    const shuffledSubset = getRandomQuestions(uni, crs, 5);
    setQuestions(shuffledSubset);
  }, [universityParam, courseParam]);

  const totalSteps = questions.length;
  const question = questions[currentStep - 1] || { category: 'Loading...', title: 'Loading question...', seconds: 90 };

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const recognitionRef = useRef(null);

  // Camera & Audio State
  const [cameraActive, setCameraActive] = useState(false);
  const [micActive, setMicActive] = useState(true);
  const [cameraError, setCameraError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Session State
  const [timeLeft, setTimeLeft] = useState(90);
  const [isRecording, setIsRecording] = useState(false);

  // Sync timer when step changes
  useEffect(() => {
    if (question?.seconds) {
      setTimeLeft(question.seconds);
    }
  }, [currentStep, questions, question]);

  // Transcript & AI Feedback
  const [transcript, setTranscript] = useState('');
  const [micLive, setMicLive] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackError, setFeedbackError] = useState(null);

  // Camera Stream Handler
  const startCamera = async () => {
    setIsInitializing(true);
    setCameraError(null);
    try {
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setCameraActive(true);
    } catch (err) {
      setCameraError('Unable to access camera or microphone.');
      setCameraActive(false);
    } finally {
      setIsInitializing(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraActive(false);
  };

  const toggleMic = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach((t) => (t.enabled = !micActive));
      setMicActive(!micActive);
    }
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  // Speech Recognition
  const startRecognition = useCallback(() => {
    const SR = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SR) return;
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-GB';
    let finalText = '';
    rec.onresult = (e) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += t + ' ';
        else interim += t;
      }
      setTranscript((finalText + interim).trim());
    };
    rec.onerror = () => setMicLive(false);
    rec.onend = () => {
      if (recognitionRef.current === rec) {
        try { rec.start(); } catch (e) {}
      }
    };
    try {
      rec.start();
      setMicLive(true);
    } catch (e) { setMicLive(false); }
    recognitionRef.current = rec;
  }, []);

  const stopRecognition = () => {
    if (recognitionRef.current) {
      const rec = recognitionRef.current;
      recognitionRef.current = null;
      try { rec.onend = null; rec.stop(); } catch (e) {}
    }
    setMicLive(false);
  };

  // Timer Loop
  useEffect(() => {
    let timer;
    if (isRecording && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (isRecording && timeLeft === 0) {
      handleFinishAnswer();
    }
    return () => clearInterval(timer);
  }, [isRecording, timeLeft]);

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const handleStartRecording = () => {
    setTranscript('');
    setFeedback(null);
    setFeedbackError(null);
    setIsRecording(true);
    startRecognition();
  };

  const handleFinishAnswer = async () => {
    setIsRecording(false);
    stopRecognition();

    if (!transcript.trim()) {
      setFeedbackError("No spoken answer recorded. Verify your mic or type your response directly below.");
      return;
    }

    setIsSubmitting(true);
    setFeedbackError(null);
    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          university: universityParam || localStorage.getItem('target_university'),
          course: courseParam || localStorage.getItem('target_course'),
          category: question.category,
          question: question.title,
          transcript: transcript.trim(),
        }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setFeedback(data);
    } catch (err) {
      setFeedbackError('Unable to generate AI evaluation right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
      setTranscript('');
      setFeedback(null);
      setFeedbackError(null);
    } else {
      alert('Mock interview session completed!');
    }
  };

  const progressPct = question.seconds ? ((question.seconds - timeLeft) / question.seconds) * 100 : 0;

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ background: BRAND.paper, color: BRAND.ink }}>

      {/* Top Header */}
      <header className="px-8 py-3.5 flex items-center justify-between sticky top-0 z-50 border-b bg-white/80 backdrop-blur-xl shadow-xs" style={{ borderColor: BRAND.border }}>
        <div className="flex items-center space-x-3.5">
          <div className="h-10 w-10 rounded-xl flex items-center justify-center font-extrabold text-lg shadow-md shadow-indigo-900/10" style={{ background: BRAND.navy, color: BRAND.gold }}>
            A
          </div>
          <div>
            <div className="text-base font-bold tracking-tight" style={{ color: BRAND.navyDeep }}>Aspiraway AI Evaluator</div>
            <div className="text-[11px] font-medium" style={{ color: BRAND.inkSoft }}>
              {universityParam || localStorage.getItem('target_university') || 'Pre-CAS Practice'}
            </div>
          </div>
        </div>

        {/* Controls / Timer */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-xs font-semibold px-3.5 py-1.5 rounded-full border bg-slate-50 shadow-inner" style={{ borderColor: BRAND.border, color: BRAND.inkSoft }}>
            <Clock className="w-3.5 h-3.5" style={{ color: BRAND.navy }} />
            <span>Time Left: <strong className="font-mono text-sm ml-0.5" style={{ color: BRAND.navyDeep }}>{formatTime(timeLeft)}</strong></span>
          </div>

          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full border bg-white shadow-xs" style={{ borderColor: BRAND.border }}>
            <span className={`h-2.5 w-2.5 rounded-full ${isRecording ? 'bg-red-500 animate-ping' : 'bg-slate-300'}`} />
            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: BRAND.inkSoft }}>
              {isRecording ? 'Live Recording' : 'Standby'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 p-8 max-w-[1440px] mx-auto w-full">

        {/* Left Column: Webcam & Live Transcript */}
        <div className="lg:col-span-7 flex flex-col space-y-5">
          
          <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border bg-slate-950 group" style={{ borderColor: BRAND.border }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transition-opacity duration-500 transform -scale-x-100"
              style={{ opacity: cameraActive ? 1 : 0 }}
            />

            {isInitializing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-slate-950/90 backdrop-blur-md">
                <Loader2 className="w-9 h-9 animate-spin mb-3" style={{ color: BRAND.gold }} />
                <p className="text-xs font-semibold tracking-wide" style={{ color: BRAND.goldSoft }}>Connecting Camera Feed...</p>
              </div>
            )}

            {!cameraActive && !isInitializing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 z-20 bg-slate-950/95">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3 border bg-slate-900" style={{ borderColor: BRAND.gold, color: BRAND.gold }}>
                  <VideoOff className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-1">Camera Muted</h3>
                <p className="text-xs max-w-sm mb-4 leading-relaxed" style={{ color: BRAND.inkSoft }}>{cameraError || 'Webcam feed is currently turned off.'}</p>
                <button onClick={startCamera} className="px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 mt-2" style={{ background: BRAND.gold, color: BRAND.navyDeep }}>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Re-enable Camera</span>
                </button>
              </div>
            )}

            {cameraActive && (
              <div className="absolute top-4 left-4 z-10 pointer-events-none">
                <span className="text-[11px] font-semibold px-3 py-1 rounded-full border backdrop-blur-md flex items-center space-x-2 bg-slate-950/60 text-slate-200" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>HD Live Feed</span>
                </span>
              </div>
            )}

            {cameraActive && micActive && (
              <div className="absolute bottom-16 right-4 z-10 bg-slate-950/60 backdrop-blur-md px-3 py-1.5 rounded-full border flex items-center space-x-2 text-xs text-slate-300" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>
                <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span className="text-[11px] font-mono">Mic Active</span>
              </div>
            )}

            {/* Camera Overlay Controls */}
            <div className="absolute bottom-4 inset-x-0 mx-auto w-max rounded-2xl px-4 py-2 flex items-center space-x-3 shadow-2xl border bg-slate-950/80 backdrop-blur-xl z-20" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>
              <button onClick={cameraActive ? stopCamera : startCamera} className="p-2.5 rounded-xl hover:bg-white/10 text-slate-200">
                {cameraActive ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4 text-red-400" />}
              </button>
              <button onClick={toggleMic} className="p-2.5 rounded-xl hover:bg-white/10 text-slate-200">
                {micActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4 text-red-400" />}
              </button>

              <div className="h-4 w-px bg-slate-800" />

              {!isRecording ? (
                <button 
                  onClick={handleStartRecording} 
                  disabled={!cameraActive || isSubmitting} 
                  className="px-5 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all disabled:opacity-40" 
                  style={{ background: BRAND.gold, color: BRAND.navyDeep }}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Begin Answer</span>
                </button>
              ) : (
                <button 
                  onClick={handleFinishAnswer} 
                  className="px-5 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30"
                >
                  <Pause className="w-3.5 h-3.5" />
                  <span>Stop & Submit</span>
                </button>
              )}
            </div>
          </div>

          <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden shadow-inner">
            <div className="h-full transition-all duration-1000 ease-linear rounded-full" style={{ width: `${progressPct}%`, background: BRAND.navy }} />
          </div>

          {/* Transcript Box */}
          <div className="rounded-2xl p-5 border bg-white shadow-xs space-y-2.5" style={{ borderColor: BRAND.border }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Live Speech Transcript</span>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${micLive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                {micLive ? '● Speech Engine Active' : 'Manual Input Ready'}
              </span>
            </div>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Your spoken response will transcribe live here..."
              className="w-full min-h-[110px] rounded-xl p-3.5 text-sm outline-none resize-y"
              style={{ background: BRAND.paper, border: `1px solid ${BRAND.border}`, color: BRAND.ink }}
            />
          </div>

          <div className="rounded-xl p-4 flex items-start space-x-3 border bg-amber-50/60" style={{ borderColor: '#FDE68A' }}>
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
            <p className="text-xs leading-relaxed text-amber-900">
              <strong>Evaluation Tip:</strong> Ensure your answers address specific dates, financial figures, and academic reasons. AI analysis is based directly on your transcribed text.
            </p>
          </div>
        </div>

        {/* Right Column: Dynamic Question Panel & Feedback */}
        <div className="lg:col-span-5 flex flex-col space-y-5">
          
          <div className="rounded-3xl p-6 border bg-white shadow-sm flex flex-col justify-between" style={{ borderColor: BRAND.border }}>
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-lg border" style={{ color: BRAND.navy, background: `${BRAND.navy}0D`, borderColor: `${BRAND.navy}20` }}>
                  {question.category}
                </span>
                <span className="text-xs font-mono font-semibold" style={{ color: BRAND.inkSoft }}>
                  Question {currentStep} of {totalSteps}
                </span>
              </div>

              <h2 className="text-lg font-bold leading-snug mb-2" style={{ color: BRAND.navyDeep }}>
                {question.title}
              </h2>
              <p className="text-xs leading-relaxed text-slate-500 mb-6">
                Tailored question based on your target course and university configuration.
              </p>
            </div>

            {feedback && (
              <button
                onClick={handleNextQuestion}
                className="w-full py-3.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-transform active:scale-98 shadow-md"
                style={{ background: BRAND.navy, color: '#FFFFFF' }}
              >
                <span>{currentStep === totalSteps ? 'Finish Session' : 'Continue to Next Question'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* AI Feedback Display */}
          {isSubmitting && (
            <div className="rounded-3xl p-6 border bg-white shadow-sm flex items-center space-x-3.5" style={{ borderColor: BRAND.border }}>
              <Loader2 className="w-5 h-5 animate-spin" style={{ color: BRAND.navy }} />
              <span className="text-xs font-semibold text-slate-600">Evaluating response for credibility...</span>
            </div>
          )}

          {feedbackError && !isSubmitting && (
            <div className="rounded-2xl p-4 border text-xs leading-relaxed" style={{ background: BRAND.redSoft, borderColor: '#FCA5A5', color: BRAND.red }}>
              {feedbackError}
            </div>
          )}

          {feedback && !isSubmitting && (
            <div className="rounded-3xl p-6 border bg-white shadow-md space-y-5" style={{ borderColor: BRAND.border }}>
              <div className="flex items-center space-x-4 border-b pb-4" style={{ borderColor: BRAND.border }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg text-white shadow-inner" style={{ background: BRAND.navyDeep }}>
                  {feedback.score}<span className="text-xs text-slate-400 font-normal">/10</span>
                </div>
                <div>
                  <div className="flex items-center space-x-1 text-xs font-bold uppercase tracking-wider text-amber-600 mb-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Analysis</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-normal">{feedback.summary}</p>
                </div>
              </div>

              <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                <FeedbackList icon={<ThumbsUp className="w-3.5 h-3.5" />} label="Key Strengths" items={feedback.strengths} color={BRAND.green} bg={BRAND.greenSoft} text="#065F46" />
                <FeedbackList icon={<TrendingUp className="w-3.5 h-3.5" />} label="Areas for Improvement" items={feedback.weaknesses} color={BRAND.amber} bg={BRAND.amberSoft} text="#92400E" />
                <FeedbackList icon={<Lightbulb className="w-3.5 h-3.5" />} label="Actionable Advice" items={feedback.tips} color={BRAND.navy} bg={`${BRAND.navy}0D`} text={BRAND.navyDeep} />
                {feedback.red_flags?.length > 0 && (
                  <FeedbackList icon={<ShieldAlert className="w-3.5 h-3.5" />} label="Credibility Concerns" items={feedback.red_flags} color={BRAND.red} bg={BRAND.redSoft} text="#991B1B" />
                )}
              </div>
            </div>
          )}

          {/* Shuffled Roadmap Stepper */}
          <div className="rounded-3xl p-6 border bg-white shadow-sm flex-1" style={{ borderColor: BRAND.border }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Shuffled Question Sequence
              </h3>
              <Shuffle className="w-3.5 h-3.5 text-slate-400" />
            </div>

            <div className="space-y-2.5">
              {questions.map((q, idx) => {
                const stepNum = idx + 1;
                const isCompleted = stepNum < currentStep;
                const isCurrent = stepNum === currentStep;

                return (
                  <div 
                    key={idx} 
                    className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                      isCurrent 
                        ? 'bg-indigo-50/50 border-indigo-200' 
                        : isCompleted 
                        ? 'bg-slate-50/50 border-slate-100' 
                        : 'bg-white border-slate-100'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        isCompleted ? 'bg-emerald-500 text-white' : isCurrent ? 'bg-indigo-900 text-white' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : stepNum}
                      </div>
                      <span className={`text-xs font-medium line-clamp-1 ${isCurrent ? 'text-indigo-950 font-bold' : 'text-slate-500'}`}>
                        {q.title}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}

function FeedbackList({ icon, label, items, color, bg, text }) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <h4 className="text-[10px] font-black uppercase tracking-wider mb-1.5 flex items-center space-x-1.5" style={{ color }}>
        {icon}
        <span>{label}</span>
      </h4>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="text-xs leading-relaxed rounded-lg px-3 py-1.5 font-medium" style={{ background: bg, color: text }}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function EvaluatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="flex items-center space-x-3 text-slate-600">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-900" />
            <span className="text-sm font-semibold">Loading Evaluator Workspace...</span>
          </div>
        </div>
      }
    >
      <EvaluateContent />
    </Suspense>
  );
}