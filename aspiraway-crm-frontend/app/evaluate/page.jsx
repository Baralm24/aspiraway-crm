'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Video, VideoOff, Mic, MicOff, Play, CheckCircle, 
  Clock, AlertCircle, RefreshCw, ChevronRight, Activity, Loader2, Brain, Square
} from 'lucide-react';

function EvaluateContent() {
  const searchParams = useSearchParams();

  // Extract dynamic target university & course
  const universityParam = searchParams.get('university') || searchParams.get('uni') || '';
  const courseParam = searchParams.get('course') || searchParams.get('program') || '';

  const [targetUni, setTargetUni] = useState('');
  const [targetCourse, setTargetCourse] = useState('');
  const [questions, setQuestions] = useState([]);

  // Camera & Audio State
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  
  const [cameraActive, setCameraActive] = useState(false);
  const [micActive, setMicActive] = useState(true);
  const [cameraError, setCameraError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Pre-CAS Recording Settings & Timer States
  const [currentStep, setCurrentStep] = useState(1);
  const [phase, setPhase] = useState('prep'); // 'prep' | 'recording' | 'review'
  const [prepDuration, setPrepDuration] = useState(30); // Thinking time in seconds (e.g. 30s)
  const [responseLimit, setResponseLimit] = useState(60); // Max response time: 30s | 60s | 90s
  const [timeLeft, setTimeLeft] = useState(30);

  // Load context & generate comprehensive 20 Pre-CAS Questions
  useEffect(() => {
    const uni = universityParam || localStorage.getItem('target_university') || localStorage.getItem('selected_university') || 'Target University';
    const course = courseParam || localStorage.getItem('target_course') || localStorage.getItem('selected_course') || 'Selected Program';

    setTargetUni(uni);
    setTargetCourse(course);

    const preCasQuestions = [
      // 1. Personal & Academic Background (1-4)
      { id: 1, title: "Please state your full name, date of birth, and summarize your highest academic qualification.", category: "Pre-CAS Credibility" },
      { id: 2, title: `Why did you choose to study ${course} instead of continuing studies in your home country?`, category: "Academic Intent" },
      { id: 3, title: "If you have any study gaps, please explain the activities or employment during that period.", category: "Background & Gaps" },
      { id: 4, title: "How does your academic background prepare you for the modules in this course?", category: "Academic Preparedness" },

      // 2. University Choice & Location (5-8)
      { id: 5, title: `Why did you choose ${uni} specifically over other universities in the UK/abroad?`, category: "University Research" },
      { id: 6, title: "Where is your target campus located, and what living arrangements have you planned?", category: "Campus & Accommodation" },
      { id: 7, title: "Name at least three specific modules from your chosen course and explain why they interest you.", category: "Course Knowledge" },
      { id: 8, title: "Who is the head of the department or lead tutor for your program, if known, or how is the course evaluated?", category: "Course Knowledge" },

      // 3. Financial Capability & Sponsorship (9-12)
      { id: 9, title: "What is the total tuition fee for your course, and how much deposit have you paid?", category: "Financial Verification" },
      { id: 10, title: "Who is funding your education, and what is their official occupation and annual income?", category: "Sponsorship Details" },
      { id: 11, title: "What are your estimated monthly living costs for housing, food, and transport during your studies?", category: "Financial Awareness" },
      { id: 12, title: "Are you aware of the visa restrictions regarding work hours for international students?", category: "Immigration Rules" },

      // 4. Career Progression & Future Intentions (13-16)
      { id: 13, title: "What specific position or job role do you intend to pursue immediately after graduation?", category: "Career Goals" },
      { id: 14, title: "Name 2 to 3 target employers in your home country where you plan to apply after completing this degree.", category: "Career Goals" },
      { id: 15, title: "What starting salary do you expect to earn in your home country upon completing this program?", category: "ROI & Career Goals" },
      { id: 16, title: "How will the return on investment (ROI) of this degree justify the financial costs incurred?", category: "Career Justification" },

      // 5. Pre-CAS Compliance & Credibility Check (17-20)
      { id: 17, title: "Do you intend to remain in the host country permanently after your post-study work visa ends?", category: "Immigration Intent" },
      { id: 18, title: "Have you ever been refused a visa for any country previously? If yes, provide details.", category: "Immigration History" },
      { id: 19, title: "How will this specific degree set you apart from local graduates in your home job market?", category: "Credibility Check" },
      { id: 20, title: "Confirm that all financial and academic documents submitted for this application are genuine and authentic.", category: "Pre-CAS Compliance" }
    ];

    setQuestions(preCasQuestions);
  }, [universityParam, courseParam]);

  const totalSteps = questions.length || 20;
  const currentQuestion = questions[currentStep - 1] || { category: "Pre-CAS", title: "Loading question..." };

  // Initialize Camera Stream
  const startCamera = async () => {
    setIsInitializing(true);
    setCameraError(null);

    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
        audio: true,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch((err) => console.log("Play interrupted:", err));
      }

      setCameraActive(true);
    } catch (err) {
      console.error("Camera access error:", err);
      setCameraError(
        err.name === 'NotAllowedError' 
          ? "Camera permission denied. Please allow camera access in your browser settings."
          : "Unable to access camera or microphone device."
      );
      setCameraActive(false);
    } finally {
      setIsInitializing(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const toggleMic = () => {
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !micActive;
      });
      setMicActive(!micActive);
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  // Pre-CAS Timer Management Phase Control
  useEffect(() => {
    let timer;
    if (timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0) {
      if (phase === 'prep') {
        // Preparation period ended -> auto-start recording response
        setPhase('recording');
        setTimeLeft(responseLimit);
      } else if (phase === 'recording') {
        // Response time limit reached -> stop recording and wait for next question
        setPhase('review');
      }
    }
    return () => clearInterval(timer);
  }, [timeLeft, phase, responseLimit]);

  const handleStartRecordingEarly = () => {
    setPhase('recording');
    setTimeLeft(responseLimit);
  };

  const handleStopRecording = () => {
    setPhase('review');
    setTimeLeft(0);
  };

  const handleNextQuestion = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
      setPhase('prep');
      setTimeLeft(prepDuration);
    } else {
      alert("Pre-CAS Mock Evaluation Completed! Your answers are saved for review.");
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/30">
            A
          </div>
          <div>
            <span className="text-lg font-semibold tracking-tight text-white block">
              Aspiraway Pre-CAS Mock Evaluator
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              {targetUni} • {targetCourse}
            </span>
          </div>
        </div>

        {/* Dynamic Controls & Timer */}
        <div className="flex items-center space-x-6">
          {/* Response Limit selector */}
          <div className="flex items-center space-x-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
            <span className="text-slate-400 font-medium">Answer Limit:</span>
            {[30, 60, 90].map((sec) => (
              <button
                key={sec}
                onClick={() => {
                  setResponseLimit(sec);
                  if (phase === 'recording') setTimeLeft(sec);
                }}
                className={`px-2 py-0.5 rounded font-mono font-bold transition-all ${
                  responseLimit === sec
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {sec}s
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2 text-sm text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>
              {phase === 'prep' ? 'Thinking Time: ' : 'Recording Time: '}
              <strong className={`font-mono ${phase === 'recording' ? 'text-red-400' : 'text-amber-400'}`}>
                {formatTime(timeLeft)}
              </strong>
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                phase === 'recording' ? 'bg-red-500 animate-pulse' : phase === 'prep' ? 'bg-amber-400 animate-ping' : 'bg-slate-500'
              }`}
            />
            <span className="text-xs font-medium uppercase tracking-wider text-slate-300">
              {phase === 'prep' ? 'Thinking Phase' : phase === 'recording' ? 'Recording Live' : 'Response Locked'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Workspace */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 max-w-7xl mx-auto w-full">
        
        {/* Left / Center: Camera Screen & Overlay Controls (8 cols) */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          
          {/* Main Camera Container */}
          <div className="relative aspect-video bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex items-center justify-center group">
            
            {/* The Live Video Element */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover transform -scale-x-100 transition-opacity duration-500 ${
                cameraActive ? 'opacity-100' : 'opacity-0'
              }`}
            />

            {/* Preparation Overlay */}
            {phase === 'prep' && cameraActive && !isInitializing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/70 backdrop-blur-sm z-10 text-center p-6">
                <Brain className="w-10 h-10 text-amber-400 animate-bounce mb-2" />
                <h3 className="text-lg font-bold text-white mb-1">Preparation Time</h3>
                <p className="text-xs text-slate-300 max-w-md mb-4">
                  Review the question on the right. Formulate your thoughts before recording begins automatically.
                </p>
                <div className="text-3xl font-mono font-bold text-amber-400 bg-amber-950/60 px-6 py-2 rounded-xl border border-amber-800/60">
                  {formatTime(timeLeft)}
                </div>
              </div>
            )}

            {/* Loading / Connecting Overlay */}
            {isInitializing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-sm z-10">
                <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
                <p className="text-sm font-medium text-slate-300">Initializing camera feed...</p>
              </div>
            )}

            {/* Error Overlay */}
            {!cameraActive && !isInitializing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/95 text-center p-6 z-10">
                <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center mb-4 text-slate-400 border border-slate-700">
                  <VideoOff className="w-7 h-7" />
                </div>
                <h3 className="text-base font-semibold text-white mb-1">Camera Feed Unavailable</h3>
                <p className="text-xs text-slate-400 max-w-md mb-4">
                  {cameraError || "Your webcam is currently disabled or turned off."}
                </p>
                <button
                  onClick={startCamera}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all flex items-center space-x-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Camera Stream</span>
                </button>
              </div>
            )}

            {/* Live Visual Indicator Badges on Video */}
            {cameraActive && (
              <div className="absolute top-4 left-4 flex items-center space-x-2 pointer-events-none">
                <span className="bg-slate-950/70 backdrop-blur-md text-xs px-3 py-1 rounded-full text-slate-200 border border-slate-800/80 flex items-center space-x-1.5">
                  <span className={`w-2 h-2 rounded-full ${phase === 'recording' ? 'bg-red-500 animate-ping' : 'bg-emerald-500'}`} />
                  <span>Pre-CAS Live • HD 720p</span>
                </span>
              </div>
            )}

            {/* Audio Waveform Indicator Bar */}
            {cameraActive && micActive && (
              <div className="absolute bottom-16 right-4 bg-slate-950/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 flex items-center space-x-1">
                <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span className="text-xs font-mono text-slate-300">Mic Active</span>
              </div>
            )}

            {/* Floating Control Bar */}
            <div className="absolute bottom-4 inset-x-0 mx-auto w-max bg-slate-950/80 backdrop-blur-lg border border-slate-800/80 rounded-2xl px-4 py-2 flex items-center space-x-3 shadow-xl z-20">
              <button
                onClick={cameraActive ? stopCamera : startCamera}
                className={`p-2.5 rounded-xl transition-colors ${
                  cameraActive 
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' 
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}
                title={cameraActive ? "Turn Off Camera" : "Turn On Camera"}
              >
                {cameraActive ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>

              <button
                onClick={toggleMic}
                className={`p-2.5 rounded-xl transition-colors ${
                  micActive 
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' 
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}
                title={micActive ? "Mute Microphone" : "Unmute Microphone"}
              >
                {micActive ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>

              <div className="h-5 w-px bg-slate-800 mx-1" />

              {phase === 'prep' && (
                <button
                  onClick={handleStartRecordingEarly}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center space-x-2 transition-all shadow-md shadow-amber-600/30"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start Recording Now</span>
                </button>
              )}

              {phase === 'recording' && (
                <button
                  onClick={handleStopRecording}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold flex items-center space-x-2 transition-all shadow-md shadow-red-600/30"
                >
                  <Square className="w-4 h-4 fill-current" />
                  <span>Stop & Save Response</span>
                </button>
              )}

              {phase === 'review' && (
                <span className="text-xs font-medium text-emerald-400 px-3 py-1 bg-emerald-950/60 rounded-lg border border-emerald-800/50">
                  Response Captured ✓
                </span>
              )}
            </div>
          </div>

          {/* Real-Time Guidance */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>Pre-CAS Tip:</strong> Answer clearly without reading from prepared notes. Immigration officers assess spontaneous fluency, financial clarity, and authentic motivation.
            </p>
          </div>
        </div>

        {/* Right Sidebar: Step Tracker & Prompt (4 cols) */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          
          {/* Question Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-950/80 px-2.5 py-1 rounded-md border border-indigo-800/50">
                  {currentQuestion.category}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Question {currentStep} of {totalSteps}
                </span>
              </div>

              <h2 className="text-lg font-semibold text-white mb-3 leading-snug">
                {currentQuestion.title}
              </h2>

              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                {phase === 'prep' 
                  ? `Thinking phase active (${timeLeft}s remaining). Recording starts automatically.` 
                  : phase === 'recording'
                  ? `Recording in progress. Limit set to ${responseLimit} seconds.`
                  : "Response captured. Click 'Next Question' to proceed."}
              </p>
            </div>

            <button
              onClick={handleNextQuestion}
              disabled={phase === 'recording'}
              className={`w-full py-3 rounded-xl font-semibold text-xs transition-all flex items-center justify-center space-x-2 shadow-lg ${
                phase === 'recording'
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
              }`}
            >
              <span>{currentStep === totalSteps ? 'Complete Session' : 'Next Question'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Question Progress List */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex-1 flex flex-col max-h-[380px]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 shrink-0">
              Session Progress ({currentStep}/{totalSteps})
            </h3>

            <div className="space-y-2.5 overflow-y-auto pr-1 flex-1 custom-scrollbar">
              {questions.map((q, idx) => {
                const stepNum = idx + 1;
                const isCompleted = stepNum < currentStep;
                const isCurrent = stepNum === currentStep;

                return (
                  <div
                    key={q.id}
                    className={`p-2.5 rounded-xl border transition-all flex items-center justify-between ${
                      isCurrent
                        ? 'bg-indigo-950/40 border-indigo-600/60 text-white'
                        : isCompleted
                        ? 'bg-slate-950/50 border-slate-800/60 text-slate-400'
                        : 'bg-slate-950/20 border-slate-900 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          isCompleted
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : isCurrent
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {isCompleted ? <CheckCircle className="w-3.5 h-3.5" /> : stepNum}
                      </div>
                      <span className="text-xs font-medium truncate">{q.title}</span>
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

// Suspense boundary export for Next.js build requirement
export default function EvaluatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-300">
          <div className="flex items-center space-x-3">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
            <span className="text-sm font-semibold">Loading Aspiraway Pre-CAS Evaluator...</span>
          </div>
        </div>
      }
    >
      <EvaluateContent />
    </Suspense>
  );
}