'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Video, VideoOff, Mic, MicOff, Play, CheckCircle, 
  Clock, AlertCircle, RefreshCw, ChevronRight, Activity, Loader2, Brain, Square,
  GraduationCap, User, Building, BookOpen, Globe, ArrowRight
} from 'lucide-react';

// Aspiraway SVG Logo Component
function AspirawayLogo() {
  return (
    <div className="flex items-center space-x-2.5">
      <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 border border-blue-400/30">
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      </div>
      <span className="text-xl font-bold tracking-tight text-white font-sans">
        aspiraway
      </span>
    </div>
  );
}

// Question Bank Template Generator
const generateDynamicQuestions = (studentName, university, course, destination) => {
  const nameStr = studentName ? `, ${studentName}` : '';
  const uniStr = university || 'your selected university';
  const courseStr = course || 'your chosen program';
  const destStr = destination || 'your destination country';

  // Question Pools with multiple variations per category
  const pools = {
    introduction: [
      `Hello${nameStr}. Please introduce yourself, stating your full name, educational background, and current qualifications.`,
      `To start off, please summarize your academic journey so far and state what brings you to apply for ${courseStr}.`,
      `Please provide a concise overview of your background, recent qualifications, and why you are taking this interview today.`
    ],
    courseRationale: [
      `Why did you choose to study ${courseStr} specifically, and how does it align with your prior education or work experience?`,
      `What specific modules or subjects within ${courseStr} are you most eager to study, and why?`,
      `How does ${courseStr} bridge the gap between your past academic achievements and your long-term career ambitions?`
    ],
    universitySelection: [
      `Why did you select ${uniStr} over other institutions offering similar degrees in ${destStr}?`,
      `What key research facilities, faculty members, or academic reputation factors attracted you to ${uniStr}?`,
      `Where is ${uniStr} located, and what made this specific campus and environment ideal for your studies?`
    ],
    destinationRationale: [
      `Why have you chosen to pursue higher education in ${destStr} rather than in your home country?`,
      `What benefits does studying in ${destStr} offer that you cannot obtain locally?`,
      `How do you anticipate adapting to the educational system and cultural environment in ${destStr}?`
    ],
    financialPlan: [
      `What is the total estimated tuition fee for ${courseStr} at ${uniStr}, and how much deposit have you paid?`,
      `Who will be sponsoring your education and living expenses, and what is their primary source of income?`,
      `Do you have an accurate breakdown of expected monthly living costs while studying at ${uniStr}?`,
      `How do you plan to manage unexpected financial contingencies during your stay in ${destStr}?`
    ],
    careerGoals: [
      `What specific job title or position do you plan to target upon returning home after completing ${courseStr}?`,
      `Name 2 to 3 target companies or organizations where you intend to apply after graduating from ${uniStr}.`,
      `What starting salary range do you anticipate earning in your home country with this qualification?`,
      `How will obtaining a degree from ${uniStr} give you a competitive advantage in your local job market?`
    ],
    immigrationCompliance: [
      `Do you fully understand the work hour limitations imposed on international student visas in ${destStr}?`,
      `What are your plans immediately after your official study and post-study duration ends?`,
      `Have you ever had a visa refusal for any country? If so, please explain the circumstances.`,
      `Can you confirm that all financial, academic, and identity documents submitted for your CAS application are genuine?`
    ]
  };

  // Utility to pick random item from array
  const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // Construct a randomized 20-question suite
  return [
    { id: 1, title: getRandom(pools.introduction), category: "Introduction & Identity" },
    { id: 2, title: getRandom(pools.courseRationale), category: "Course Choice" },
    { id: 3, title: `What alternative programs did you consider before deciding on ${courseStr}?`, category: "Academic Intent" },
    { id: 4, title: "If you have any gaps in your education or employment, please account for them clearly.", category: "Background Check" },

    { id: 5, title: getRandom(pools.universitySelection), category: "University Selection" },
    { id: 6, title: `How far is your planned accommodation from the main campus of ${uniStr}?`, category: "Logistics & Planning" },
    { id: 7, title: getRandom(pools.destinationRationale), category: "Country Selection" },
    { id: 8, title: `How did you first discover ${uniStr} and its academic offerings?`, category: "Research Credibility" },

    { id: 9, title: getRandom(pools.financialPlan), category: "Financial Verification" },
    { id: 10, title: `What proof of funds have you prepared to cover tuition and living costs at ${uniStr}?`, category: "Sponsorship Details" },
    { id: 11, title: getRandom(pools.financialPlan), category: "Living Expenses" },
    { id: 12, title: "Are you planning to rely on part-time employment to fund your tuition or essential living costs?", category: "Financial Rules" },

    { id: 13, title: getRandom(pools.careerGoals), category: "Post-Graduation Plans" },
    { id: 14, title: getRandom(pools.careerGoals), category: "Market Value & ROI" },
    { id: 15, title: `How does the investment in ${courseStr} compare to your projected future earnings?`, category: "Career Justification" },
    { id: 16, title: "Why do you not plan to seek permanent residency in your host destination after studies?", category: "Return Intent" },

    { id: 17, title: getRandom(pools.immigrationCompliance), category: "Visa Regulations" },
    { id: 18, title: getRandom(pools.immigrationCompliance), category: "Credibility Check" },
    { id: 19, title: `What will you do if your initial post-graduation job search takes longer than expected?`, category: "Contingency Plan" },
    { id: 20, title: getRandom(pools.immigrationCompliance), category: "Pre-CAS Final Declaration" }
  ];
};

function EvaluateContent() {
  const searchParams = useSearchParams();

  // Student Context State
  const [studentDetails, setStudentDetails] = useState({
    name: '',
    university: '',
    course: '',
    destination: 'United Kingdom'
  });
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);

  // Questions Array
  const [questions, setQuestions] = useState([]);

  // Camera & Audio State
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  
  const [cameraActive, setCameraActive] = useState(false);
  const [micActive, setMicActive] = useState(true);
  const [cameraError, setCameraError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(false);

  // Pre-CAS Recording Settings & Timer States
  const [currentStep, setCurrentStep] = useState(1);
  const [phase, setPhase] = useState('prep'); // 'prep' | 'recording' | 'review'
  const [prepDuration] = useState(30); // 30s prep time
  const [responseLimit, setResponseLimit] = useState(60); // 30s | 60s | 90s
  const [timeLeft, setTimeLeft] = useState(30);

  // Read URL params or set defaults
  useEffect(() => {
    const nameParam = searchParams.get('name') || '';
    const uniParam = searchParams.get('university') || searchParams.get('uni') || localStorage.getItem('target_university') || '';
    const courseParam = searchParams.get('course') || searchParams.get('program') || localStorage.getItem('target_course') || '';
    const destParam = searchParams.get('destination') || 'United Kingdom';

    if (uniParam && courseParam) {
      setStudentDetails({
        name: nameParam,
        university: uniParam,
        course: courseParam,
        destination: destParam
      });
      setQuestions(generateDynamicQuestions(nameParam, uniParam, courseParam, destParam));
      setIsFormSubmitted(true);
    }
  }, [searchParams]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!studentDetails.university || !studentDetails.course) {
      alert("Please enter both your University and Course/Major.");
      return;
    }
    setQuestions(generateDynamicQuestions(
      studentDetails.name, 
      studentDetails.university, 
      studentDetails.course, 
      studentDetails.destination
    ));
    setIsFormSubmitted(true);
    startCamera();
  };

  const totalSteps = questions.length || 20;
  const currentQuestion = questions[currentStep - 1] || { category: "Pre-CAS", title: "Preparing personalized questions..." };

  // Camera initialization
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
          ? "Camera permission denied. Please allow camera access in browser settings."
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
    if (isFormSubmitted) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isFormSubmitted]);

  // Pre-CAS Timer Management
  useEffect(() => {
    if (!isFormSubmitted) return;

    let timer;
    if (timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0) {
      if (phase === 'prep') {
        setPhase('recording');
        setTimeLeft(responseLimit);
      } else if (phase === 'recording') {
        setPhase('review');
      }
    }
    return () => clearInterval(timer);
  }, [timeLeft, phase, responseLimit, isFormSubmitted]);

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
      alert("Pre-CAS Mock Interview Completed! Your personalized session has been recorded for evaluation.");
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Render Student Personalization Form if not submitted
  if (!isFormSubmitted) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="flex flex-col items-center text-center space-y-2">
            <AspirawayLogo />
            <h1 className="text-xl font-bold text-white mt-4">Pre-CAS Mock Evaluator</h1>
            <p className="text-xs text-slate-400">
              Customize your interview questions by providing your study application details below.
            </p>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-400" /> Full Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Manish Baral"
                value={studentDetails.name}
                onChange={(e) => setStudentDetails({ ...studentDetails, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-blue-400" /> Target University *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. University of Hertfordshire"
                value={studentDetails.university}
                onChange={(e) => setStudentDetails({ ...studentDetails, university: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-blue-400" /> Course / Major *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. MSc Data Science and AI"
                value={studentDetails.course}
                onChange={(e) => setStudentDetails({ ...studentDetails, course: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-blue-400" /> Destination Country
              </label>
              <select
                value={studentDetails.destination}
                onChange={(e) => setStudentDetails({ ...studentDetails, destination: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="United Kingdom">United Kingdom</option>
                <option value="Australia">Australia</option>
                <option value="Canada">Canada</option>
                <option value="United States">United States</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2 mt-2"
            >
              <span>Generate 20-Question Mock Interview</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-4">
          <AspirawayLogo />
          <div className="h-5 w-px bg-slate-800" />
          <div>
            <span className="text-xs font-bold text-slate-200 block uppercase tracking-wider">
              Pre-CAS Credibility Evaluator
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              {studentDetails.university} • {studentDetails.course}
            </span>
          </div>
        </div>

        {/* Dynamic Controls & Timers */}
        <div className="flex items-center space-x-6">
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
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {sec}s
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2 text-sm text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
            <Clock className="w-4 h-4 text-blue-400" />
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
                <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mb-3" />
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
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all flex items-center space-x-2"
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
            <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>Pre-CAS Tip:</strong> Speak naturally without reading notes. Interviewers evaluate clear communication, financial understanding, and genuine motivation for studying at {studentDetails.university}.
            </p>
          </div>
        </div>

        {/* Right Sidebar: Step Tracker & Prompt (4 cols) */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          
          {/* Question Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-400 bg-blue-950/80 px-2.5 py-1 rounded-md border border-blue-800/50">
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
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'
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
                        ? 'bg-blue-950/40 border-blue-600/60 text-white'
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
                            ? 'bg-blue-600 text-white'
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
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            <span className="text-sm font-semibold">Loading Aspiraway Pre-CAS Evaluator...</span>
          </div>
        </div>
      }
    >
      <EvaluateContent />
    </Suspense>
  );
}