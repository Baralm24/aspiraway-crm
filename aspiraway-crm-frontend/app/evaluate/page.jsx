'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Video, VideoOff, Mic, MicOff, Play, CheckCircle, 
  Clock, AlertCircle, RefreshCw, ChevronRight, Activity, Loader2
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

  // Session State
  const [currentStep, setCurrentStep] = useState(1);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes per question
  const [isRecording, setIsRecording] = useState(false);

  // Load context & generate comprehensive 20-question suite
  useEffect(() => {
    const uni = universityParam || localStorage.getItem('target_university') || localStorage.getItem('selected_university') || 'Target University';
    const course = courseParam || localStorage.getItem('target_course') || localStorage.getItem('selected_course') || 'Selected Program';

    setTargetUni(uni);
    setTargetCourse(course);

    const fullQuestionSuite = [
      // 1. Personal & Academic Introduction (1-4)
      { id: 1, title: "Please introduce yourself and share a brief summary of your educational background.", category: "Introduction" },
      { id: 2, title: `What motivated you to apply for ${course}?`, category: "Academic Focus" },
      { id: 3, title: "How does this degree build upon your prior studies or work experience?", category: "Academic Background" },
      { id: 4, title: "What specific subject or specialization within this program interests you most?", category: "Academic Focus" },

      // 2. University & Destination Selection (5-8)
      { id: 5, title: `Why did you choose ${uni} specifically over other institutions offering similar programs?`, category: "University Choice" },
      { id: 6, title: "What key features, faculty, or research facilities attracted you to this institution?", category: "University Choice" },
      { id: 7, title: "Why do you prefer studying this program abroad rather than in your home country?", category: "Study Destination" },
      { id: 8, title: "How did you learn about this program and university?", category: "Application Context" },

      // 3. Program Preparedness & Competencies (9-12)
      { id: 9, title: "Describe a relevant academic or technical project you completed recently.", category: "Academic Preparedness" },
      { id: 10, title: "How do you handle demanding academic workloads or tight deadlines?", category: "Personal Traits" },
      { id: 11, title: "Describe a challenge you faced during a team project and how you resolved it.", category: "Problem Solving" },
      { id: 12, title: "What academic skills or knowledge do you need to improve before starting classes?", category: "Self Evaluation" },

      // 4. Financial Plan & Sponsorship (13-16)
      { id: 13, title: "How do you plan to finance your tuition fees and living expenses throughout your studies?", category: "Financial Plan" },
      { id: 14, title: "Who is sponsoring your education, and what is their primary source of income?", category: "Financial Plan" },
      { id: 15, title: "Have you secured or applied for any scholarships or financial aid?", category: "Financial Plan" },
      { id: 16, title: "Do you have an accurate estimate of your living expenses while pursuing this degree?", category: "Financial Awareness" },

      // 5. Post-Graduation & Long-Term Goals (17-20)
      { id: 17, title: `What are your immediate career plans after graduating with your degree in ${course}?`, category: "Career Goals" },
      { id: 18, title: "Where do you see yourself professionally 5 years after completing this program?", category: "Career Goals" },
      { id: 19, title: "How will the qualification from this institution enhance your career prospects in your home country?", category: "Future Outlook" },
      { id: 20, title: "Do you have any questions for the evaluation committee regarding your chosen program?", category: "Closing Question" }
    ];

    setQuestions(fullQuestionSuite);
  }, [universityParam, courseParam]);

  const totalSteps = questions.length || 20;
  const currentQuestion = questions[currentStep - 1] || { category: "Loading...", title: "Preparing question..." };

  // 1. Initialize Camera Stream
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

  // Mount/Unmount camera cleanup
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  // Session Timer
  useEffect(() => {
    let timer;
    if (isRecording && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isRecording, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleNextQuestion = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
      setTimeLeft(120);
    } else {
      setIsRecording(false);
      alert("Evaluation session completed!");
    }
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
              Aspiraway AI Mock Evaluator
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              {targetUni} • {targetCourse}
            </span>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2 text-sm text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>Time Remaining: <strong className="text-white font-mono">{formatTime(timeLeft)}</strong></span>
          </div>

          <div className="flex items-center space-x-2">
            <span className={`h-2.5 w-2.5 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-slate-500'}`} />
            <span className="text-xs font-medium uppercase tracking-wider text-slate-300">
              {isRecording ? 'Recording Live' : 'Standby'}
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

            {/* Loading / Connecting Overlay */}
            {isInitializing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-sm z-10">
                <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
                <p className="text-sm font-medium text-slate-300">Initializing camera feed...</p>
              </div>
            )}

            {/* Error or Disabled Camera Overlay */}
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
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>HD 720p • Live</span>
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

            {/* Floating Camera Control Bar */}
            <div className="absolute bottom-4 inset-x-0 mx-auto w-max bg-slate-950/80 backdrop-blur-lg border border-slate-800/80 rounded-2xl px-4 py-2 flex items-center space-x-3 shadow-xl">
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

              {!isRecording ? (
                <button
                  onClick={() => setIsRecording(true)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-2 transition-all shadow-md shadow-indigo-600/30"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start Recording</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsRecording(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 text-xs font-semibold flex items-center space-x-2 transition-all"
                >
                  <span className="w-2.5 h-2.5 rounded-sm bg-amber-400" />
                  <span>Pause</span>
                </button>
              )}
            </div>
          </div>

          {/* AI Helper Bar / Real-Time Cue */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>Tip:</strong> Speak clearly toward your microphone and maintain eye contact with the camera. The Aspiraway AI evaluator will analyze clarity, pace, and structural coherence.
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

              <h2 className="text-lg font-semibold text-white mb-2 leading-snug">
                {currentQuestion.title}
              </h2>

              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Take up to 2 minutes to respond thoroughly. Click "Next Question" when finished to proceed to the next prompt.
              </p>
            </div>

            <button
              onClick={handleNextQuestion}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/20"
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
            <span className="text-sm font-semibold">Loading Aspiraway Evaluator...</span>
          </div>
        </div>
      }
    >
      <EvaluateContent />
    </Suspense>
  );
}