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

function EvaluateContent() {
  const searchParams = useSearchParams();

  // 1. Extract context directly from URL parameters or storage dynamically
  const universityParam = searchParams.get('university') || searchParams.get('uni') || '';
  const courseParam = searchParams.get('course') || searchParams.get('program') || '';
  const studentIdParam = searchParams.get('studentId') || searchParams.get('id') || '';

  const [targetUni, setTargetUni] = useState('');
  const [targetCourse, setTargetCourse] = useState('');

  const [questions, setQuestions] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);

  // 2. Load Dynamic Questions from API or Context
  useEffect(() => {
    async function loadSessionQuestions() {
      setIsLoadingQuestions(true);

      // Check URL params first, then local storage
      const uni = universityParam || localStorage.getItem('target_university') || localStorage.getItem('selected_university') || 'Your Selected University';
      const course = courseParam || localStorage.getItem('target_course') || localStorage.getItem('selected_course') || 'Your Selected Course';

      setTargetUni(uni);
      setTargetCourse(course);

      try {
        // Fetch custom dynamic question set from your API route
        const res = await fetch(`/api/questions?university=${encodeURIComponent(uni)}&course=${encodeURIComponent(course)}&studentId=${encodeURIComponent(studentIdParam)}`);
        
        if (res.ok) {
          const data = await res.json();
          if (data?.questions && data.questions.length > 0) {
            setQuestions(data.questions);
            setIsLoadingQuestions(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Could not fetch custom API questions, generating dynamic contextual pool.');
      }

      // Fallback: Contextual dynamic generator based on actual inputs (No hardcoded data science)
      const dynamicPool = [
        { id: 1, category: 'Introduction', title: `Tell us about yourself and why you want to study at ${uni}.`, seconds: 90 },
        { id: 2, category: 'Academic Background', title: `How does your academic background prepare you for ${course}?`, seconds: 90 },
        { id: 3, category: 'University Choice', title: `Why did you choose ${uni} over other universities offering ${course}?`, seconds: 90 },
        { id: 4, category: 'Course Modules', title: `Which modules or subjects in ${course} are you most excited to study?`, seconds: 90 },
        { id: 5, category: 'Financial Genuineness', title: `Who is funding your studies for ${course}, and how are these funds arranged?`, seconds: 90 },
        { id: 6, category: 'Career Goals', title: `What are your career plans after completing ${course} at ${uni}?`, seconds: 90 },
        { id: 7, category: 'Ties Home', title: `Why do you intend to return to your home country after graduating from ${uni}?`, seconds: 90 },
      ];

      // Shuffle dynamic set
      const shuffled = [...dynamicPool].sort(() => 0.5 - Math.random());
      setQuestions(shuffled);
      setIsLoadingQuestions(false);
    }

    loadSessionQuestions();
  }, [universityParam, courseParam, studentIdParam]);

  const totalSteps = questions.length;
  const question = questions[currentStep - 1] || { category: 'Assessment', title: 'Preparing questions...', seconds: 90 };

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

  // Sync timer on question change
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

  // Speech Recognition Handler
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
          university: targetUni,
          course: targetCourse,
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

  if (isLoadingQuestions) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: BRAND.navy }} />
        <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Loading Target Program Questions...</p>
      </div>
    );
  }

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
              {targetUni} {targetCourse ? `• ${targetCourse}` : ''}
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
                Tailored dynamically for {targetCourse || 'your program'} at {targetUni || 'your university'}.
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

          {/* Dynamic Questions Stepper */}
          <div className="rounded-3xl p-6 border bg-white shadow-sm flex-1" style={{ borderColor: BRAND.border }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Session Question Sequence
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