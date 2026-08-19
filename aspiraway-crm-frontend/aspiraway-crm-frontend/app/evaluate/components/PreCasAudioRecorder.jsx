'use client';

import { useState, useRef, useEffect } from 'react';

export default function PreCasAudioRecorder({ questionText, studentInfo, onEvaluationComplete }) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);

  // Clean up timer on unmount
  useEffect(() => {
    return () => clearInterval(timerIntervalRef.current);
  }, []);

  // 1. Start Recording Audio
  const startRecording = async () => {
    setError('');
    setAudioUrl(null);
    setAudioBlob(null);
    audioChunksRef.current = [];
    setTimer(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Preferred MIME types across Chrome/Firefox/Safari
      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);

        // Stop microphone stream tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Start timer
      timerIntervalRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Microphone error:', err);
      setError('Could not access microphone. Please enable mic permissions in your browser.');
    }
  };

  // 2. Stop Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerIntervalRef.current);
    }
  };

  // 3. Send Recorded Audio to Next.js API Route (/api/evaluate-audio)
  const handleEvaluate = async () => {
    if (!audioBlob) return;

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'response.webm');
      formData.append('question', questionText || 'Pre-CAS Question');
      formData.append('studentInfo', JSON.stringify(studentInfo || {}));

      const res = await fetch('/api/evaluate-audio', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to process evaluation.');
      }

      // Pass result up to parent page
      if (onEvaluationComplete) {
        onEvaluationComplete(data.evaluation);
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError(err.message || 'Something went wrong while evaluating audio.');
    } finally {
      setLoading(false);
    }
  };

  // Format seconds to MM:SS
  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-xl p-6 bg-white rounded-xl shadow-md border border-gray-100 flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg text-gray-800">Spoken Answer Recording</h3>
        {isRecording && (
          <span className="inline-flex items-center gap-2 text-red-600 font-mono text-sm font-semibold bg-red-50 px-3 py-1 rounded-full animate-pulse">
            <span className="w-2.5 h-2.5 bg-red-600 rounded-full"></span>
            {formatTimer(timer)}
          </span>
        )}
      </div>

      {error && (
        <div className="p-3 text-sm text-red-700 bg-red-50 rounded-lg">
          {error}
        </div>
      )}

      {/* Recording Actions */}
      <div className="flex items-center gap-3">
        {!isRecording ? (
          <button
            onClick={startRecording}
            disabled={loading}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            🎙️ {audioUrl ? 'Re-record Answer' : 'Start Recording'}
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="flex-1 bg-gray-900 hover:bg-black text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition"
          >
            ⏹️ Stop Recording
          </button>
        )}
      </div>

      {/* Audio Playback Preview */}
      {audioUrl && !isRecording && (
        <div className="flex flex-col gap-3 mt-2 pt-4 border-t border-gray-100">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Preview Response</p>
          <audio src={audioUrl} controls className="w-full h-10" />

          <button
            onClick={handleEvaluate}
            disabled={loading}
            className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                Transcribing & Evaluating...
              </>
            ) : (
              '⚡ Submit for AI Evaluation'
            )}
          </button>
        </div>
      )}
    </div>
  );
}