import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Activity, MessageSquare, ShieldAlert, Eye, UserX, AppWindow, Ear, Radio, ScanFace, Lock, AlertTriangle } from 'lucide-react';
import { getGeminiInstance } from '../services/gemini';
import { InterviewSessionData } from '../types';
import { base64ToUint8Array, float32To16BitPCMBase64 } from '../utils';
import { LiveServerMessage, Modality } from '@google/genai';

interface Props {
  onComplete: (data: InterviewSessionData) => void;
  candidateName: string;
}

interface TranscriptItem {
  role: 'user' | 'model';
  text: string;
  isComplete?: boolean;
}

declare global {
  interface Window {
    FaceMesh: any;
  }
}

const LiveInterview: React.FC<Props> = ({ onComplete, candidateName }) => {
  const [active, setActive] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [connecting, setConnecting] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0); 
  const [permissionError, setPermissionError] = useState(false);
  
  // Proctoring State
  const [faceStatus, setFaceStatus] = useState<'OK' | 'NO_FACE' | 'MULTIPLE_FACES' | 'LOOKING_AWAY'>('OK');
  const [faceMeshLoaded, setFaceMeshLoaded] = useState(false);
  const [violationCount, setViolationCount] = useState(0);
  const [tabSwitchDetected, setTabSwitchDetected] = useState(false);
  const [backgroundVoiceDetected, setBackgroundVoiceDetected] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const transcriptContainerRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const outputNodeRef = useRef<GainNode | null>(null);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null); 
  const startTimeRef = useRef<number>(Date.now());
  const snapshotsRef = useRef<string[]>([]);
  const frameIntervalRef = useRef<number | null>(null);
  const nextAudioStartTimeRef = useRef<number>(0);
  const faceMeshRef = useRef<any>(null);
  const integrityEventsRef = useRef<{ timestamp: number; type: 'NO_FACE' | 'MULTIPLE_FACES' | 'LOOKING_AWAY' | 'TAB_SWITCH' | 'BACKGROUND_VOICE' }[]>([]);
  const lastMouthOpenTimeRef = useRef<number>(Date.now());
  const geminiSendCounterRef = useRef<number>(0);

  // Tab Detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && active) {
        setViolationCount(prev => prev + 1);
        setTabSwitchDetected(true);
        integrityEventsRef.current.push({ timestamp: Date.now(), type: 'TAB_SWITCH' });
        setTimeout(() => setTabSwitchDetected(false), 3000);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [active]);

  // FaceMesh Init
  useEffect(() => {
    if (window.FaceMesh) {
      const faceMesh = new window.FaceMesh({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
      });
      
      faceMesh.setOptions({
        maxNumFaces: 2,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      faceMesh.onResults((results: any) => {
        const faces = results.multiFaceLandmarks;
        let status: 'OK' | 'NO_FACE' | 'MULTIPLE_FACES' | 'LOOKING_AWAY' = 'OK';

        if (!faces || faces.length === 0) {
          status = 'NO_FACE';
        } else if (faces.length > 1) {
          status = 'MULTIPLE_FACES';
        } else {
          // Gaze Logic
          const nose = faces[0][1];
          const leftCheek = faces[0][234];
          const rightCheek = faces[0][454];
          const midX = (leftCheek.x + rightCheek.x) / 2;
          
          if (Math.abs(nose.x - midX) > 0.10) status = 'LOOKING_AWAY';

          // Mouth Logic for Voice Correlation
          const upperLip = faces[0][13];
          const lowerLip = faces[0][14];
          const topHead = faces[0][10];
          const chin = faces[0][152];
          const faceHeight = Math.sqrt(Math.pow(topHead.x - chin.x, 2) + Math.pow(topHead.y - chin.y, 2));
          const mouthOpenDist = Math.sqrt(Math.pow(upperLip.x - lowerLip.x, 2) + Math.pow(upperLip.y - lowerLip.y, 2));
          
          if (faceHeight > 0 && (mouthOpenDist / faceHeight) > 0.02) {
             lastMouthOpenTimeRef.current = Date.now();
          }
        }

        setFaceStatus(prev => {
           if (prev !== status) {
             if (status !== 'OK') {
               integrityEventsRef.current.push({ timestamp: Date.now(), type: status });
               setViolationCount(c => c + 1);
             }
             return status;
           }
           return prev;
        });
      });

      faceMeshRef.current = faceMesh;
      setFaceMeshLoaded(true);
    }
  }, []);

  // Scroll Transcript
  useEffect(() => {
    if (transcriptContainerRef.current) {
      transcriptContainerRef.current.scrollTop = transcriptContainerRef.current.scrollHeight;
    }
  }, [transcript]);

  const startSession = async () => {
    setConnecting(true);
    setPermissionError(false);
    setTranscript([]);
    setViolationCount(0);
    integrityEventsRef.current = [];
    lastMouthOpenTimeRef.current = Date.now();
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { sampleRate: 16000, echoCancellation: true, noiseSuppression: false }, 
        video: { width: 640, height: 480 }
      });
      
      if (videoRef.current) videoRef.current.srcObject = stream;

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass({ sampleRate: 24000 });
      audioContextRef.current = audioContext;
      
      const inputContext = new AudioContextClass({ sampleRate: 16000 });
      const inputSource = inputContext.createMediaStreamSource(stream);
      const processor = inputContext.createScriptProcessor(4096, 1, 1);
      
      inputSourceRef.current = inputSource;
      processorRef.current = processor;
      
      const outputNode = audioContext.createGain();
      outputNode.connect(audioContext.destination);
      outputNodeRef.current = outputNode;

      const ai = getGeminiInstance();
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setConnecting(false);
            setActive(true);
            startTimeRef.current = Date.now();
            inputSource.connect(processor);
            processor.connect(inputContext.destination);
            
            processor.onaudioprocess = (e) => {
              if (!micOn) return;
              const inputData = e.inputBuffer.getChannelData(0);
              
              // Audio Level
              let sum = 0;
              for (let i = 0; i < inputData.length; i++) sum += Math.abs(inputData[i]);
              setAudioLevel(sum / inputData.length); 

              // Background Voice Check
              let sumSquares = 0;
              for (let i = 0; i < inputData.length; i++) sumSquares += inputData[i] * inputData[i];
              const rms = Math.sqrt(sumSquares / inputData.length);
              
              const timeSinceMouthOpen = Date.now() - lastMouthOpenTimeRef.current;
              if (rms > 0.03 && timeSinceMouthOpen > 2000) {
                 if (!backgroundVoiceDetected) {
                   setBackgroundVoiceDetected(true);
                   setViolationCount(prev => prev + 1);
                   integrityEventsRef.current.push({ timestamp: Date.now(), type: 'BACKGROUND_VOICE' });
                   setTimeout(() => setBackgroundVoiceDetected(false), 3000);
                 }
                 lastMouthOpenTimeRef.current = Date.now() - 1500; 
              }

              const base64Audio = float32To16BitPCMBase64(inputData);
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: { mimeType: 'audio/pcm;rate=16000', data: base64Audio } });
              });
            };

            frameIntervalRef.current = window.setInterval(async () => {
               if (videoRef.current && canvasRef.current && sessionRef.current) {
                 const ctx = canvasRef.current.getContext('2d');
                 if (ctx && videoRef.current.readyState === 4) {
                   canvasRef.current.width = videoRef.current.videoWidth;
                   canvasRef.current.height = videoRef.current.videoHeight;
                   ctx.drawImage(videoRef.current, 0, 0);
                   
                   if (faceMeshRef.current) await faceMeshRef.current.send({image: videoRef.current});

                   geminiSendCounterRef.current++;
                   if (geminiSendCounterRef.current >= 5) {
                     geminiSendCounterRef.current = 0;
                     const base64Image = canvasRef.current.toDataURL('image/jpeg', 0.5).split(',')[1];
                     if (Math.random() > 0.95) snapshotsRef.current.push(base64Image);
                     sessionPromise.then(session => {
                       session.sendRealtimeInput({ media: { mimeType: 'image/jpeg', data: base64Image } });
                     });
                   }
                 }
               }
            }, 200); 
          },
          onmessage: async (msg: LiveServerMessage) => {
            const { serverContent } = msg;
            if (serverContent?.interrupted) {
                audioSourcesRef.current.forEach(source => { try { source.stop(); } catch(e) {} });
                audioSourcesRef.current.clear();
                nextAudioStartTimeRef.current = 0;
                setTranscript(prev => {
                    const newTx = [...prev];
                    if (newTx.length > 0 && newTx[newTx.length - 1].role === 'model') {
                        newTx[newTx.length - 1].isComplete = true;
                        newTx[newTx.length - 1].text += " [Interrupted]";
                    }
                    return newTx;
                });
            }

            const audioData = serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData && audioContextRef.current && outputNodeRef.current) {
              const audioBytes = base64ToUint8Array(audioData);
              const audioBuffer = await decodeAudioData(audioBytes, audioContextRef.current);
              if (audioBuffer) {
                  const source = audioContextRef.current.createBufferSource();
                  source.buffer = audioBuffer;
                  source.connect(outputNodeRef.current);
                  audioSourcesRef.current.add(source);
                  source.onended = () => audioSourcesRef.current.delete(source);
                  source.start(nextAudioStartTimeRef.current);
                  nextAudioStartTimeRef.current = Math.max(audioContextRef.current.currentTime, nextAudioStartTimeRef.current) + audioBuffer.duration;
              }
            }

            if (serverContent?.inputTranscription?.text) {
               const text = serverContent.inputTranscription.text;
               setTranscript(prev => {
                  const newTx = [...prev];
                  const last = newTx[newTx.length - 1];
                  if (last?.role === 'user' && !last.isComplete) {
                     newTx[newTx.length - 1].text += text;
                  } else {
                     if (last) last.isComplete = true;
                     newTx.push({ role: 'user', text, isComplete: false });
                  }
                  return newTx;
               });
            }

            if (serverContent?.outputTranscription?.text) {
               const text = serverContent.outputTranscription.text;
               setTranscript(prev => {
                  const newTx = [...prev];
                  const last = newTx[newTx.length - 1];
                  if (last?.role === 'model' && !last.isComplete) {
                     newTx[newTx.length - 1].text += text;
                  } else {
                     if (last) last.isComplete = true;
                     newTx.push({ role: 'model', text, isComplete: false });
                  }
                  return newTx;
               });
            }

            if (serverContent?.turnComplete) {
              setTranscript(prev => {
                 const newTx = [...prev];
                 if (newTx.length > 0) newTx[newTx.length - 1].isComplete = true;
                 return newTx;
              });
            }
          },
          onclose: cleanup,
          onerror: cleanup
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
          inputAudioTranscription: {}, 
          outputAudioTranscription: {},
          systemInstruction: `You are Sarah, an expert technical interviewer evaluating ${candidateName}. 
          Conduct a behavioral and technical interview. 
          Analyze communication skills, confidence, and technical depth.
          Be professional, encouraging, but probe for details.`,
        }
      });
      sessionPromise.then(s => sessionRef.current = s);
    } catch (err: any) {
      console.error(err);
      setConnecting(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionError(true);
      } else {
        alert("Device Access Failed: " + (err.message || 'Unknown error'));
      }
    }
  };

  const endSession = () => {
    const finalTranscript = transcript.map(t => ({ role: t.role, text: t.text }));
    cleanup();
    onComplete({
      transcript: finalTranscript,
      duration: (Date.now() - startTimeRef.current) / 1000,
      videoSnapshots: snapshotsRef.current,
      integrityEvents: integrityEventsRef.current
    });
  };

  const cleanup = () => {
    if (processorRef.current) processorRef.current.disconnect();
    if (inputSourceRef.current) inputSourceRef.current.disconnect();
    
    // Safely close audio context
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try { audioContextRef.current.close(); } catch(e) { console.warn(e); }
    }
    
    if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);
    if (videoRef.current?.srcObject) (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    audioSourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
    audioSourcesRef.current.clear();
    setActive(false);
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext) => {
    if (!data || data.length === 0) return null;
    try {
      const int16 = new Int16Array(data.buffer);
      const float32 = new Float32Array(int16.length);
      for (let i = 0; i < int16.length; i++) float32[i] = int16[i] / 32768.0;
      const buffer = ctx.createBuffer(1, float32.length, 24000);
      buffer.getChannelData(0).set(float32);
      return buffer;
    } catch (e) {
      console.error("Audio Decode Error", e);
      return null;
    }
  };

  return (
    <div className="h-full flex flex-col p-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 px-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">Multimodal Assessment</span>
          </div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            AI Interview <span className="text-slate-500 font-normal">/ {candidateName}</span>
          </h2>
        </div>
        {active && (
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 text-red-500 rounded-full text-xs font-bold border border-red-500/20">
               <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
               REC
             </div>
             <div className="h-6 w-px bg-white/10"></div>
             <button onClick={endSession} className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium shadow-lg shadow-red-500/20 transition-all">
               <PhoneOff size={18} className="inline mr-2" /> End Session
             </button>
          </div>
        )}
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-0">
        {/* Left: Video Feed */}
        <div className={`relative bg-black rounded-3xl overflow-hidden shadow-2xl border transition-all duration-300 group ${
          (faceStatus !== 'OK' || tabSwitchDetected || backgroundVoiceDetected) && active ? 'border-red-500/50 shadow-red-900/20' : 'border-slate-800'
        }`}>
          <video 
            ref={videoRef} 
            autoPlay muted playsInline 
            className={`w-full h-full object-cover transform scale-x-[-1] transition-opacity duration-300 ${faceStatus !== 'OK' ? 'opacity-40' : 'opacity-100'}`} 
          />
          
          {/* HUD Overlay */}
          <div className="absolute inset-0 pointer-events-none border-[1px] border-white/5 rounded-3xl"></div>
          
          {/* Status Overlay */}
          <div className="absolute top-6 left-6 flex items-center gap-3">
             <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
                <ScanFace size={16} className={faceStatus === 'OK' ? "text-emerald-400" : "text-red-400"} />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  {faceStatus === 'OK' ? 'Face Tracking Active' : 'Face Detection Error'}
                </span>
             </div>
          </div>

          {/* CRITICAL ALERTS */}
          {active && (faceStatus === 'NO_FACE' || faceStatus === 'MULTIPLE_FACES' || tabSwitchDetected) && (
             <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md z-30">
               <div className="bg-red-900/90 border border-red-500 text-white px-8 py-6 rounded-2xl shadow-2xl flex flex-col items-center gap-4 max-w-sm text-center animate-in fade-in zoom-in duration-200">
                  <div className="p-4 bg-red-950 rounded-full border border-red-500/30">
                     {tabSwitchDetected ? <AppWindow size={32}/> : <UserX size={32}/>}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Proctoring Alert</h3>
                    <p className="text-sm text-red-200 mt-1">
                      {tabSwitchDetected ? "Focus lost. Please return to the interview." : "Face visibility issue detected."}
                    </p>
                  </div>
               </div>
             </div>
          )}

          {/* WARNING ALERTS */}
          {active && (faceStatus === 'LOOKING_AWAY' || backgroundVoiceDetected) && (
             <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-20 w-auto">
               <div className="bg-yellow-500/90 text-black px-6 py-3 rounded-full font-bold shadow-lg flex items-center gap-3 animate-bounce border-2 border-yellow-400">
                  {backgroundVoiceDetected ? <Ear size={20}/> : <Eye size={20} />}
                  <span>{backgroundVoiceDetected ? "Audio anomaly detected" : "Please maintain eye contact"}</span>
               </div>
             </div>
          )}
        </div>

        {/* Right: AI & Transcript */}
        <div className="flex flex-col gap-6">
          {/* AI Avatar */}
          <div className={`rounded-3xl p-1 transition-all duration-500 relative overflow-hidden ${active ? 'flex-[0.3]' : 'flex-1'} `}>
             <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl h-full flex flex-col items-center justify-center relative p-8 text-center shadow-xl">
               {active ? (
                 <>
                   <div className="relative mb-6">
                     <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center shadow-[0_0_40px_rgba(59,130,246,0.4)]">
                        <Activity className="text-white animate-pulse" size={40} />
                     </div>
                   </div>
                   <h3 className="text-xl font-bold text-white">AI Interviewer Active</h3>
                 </>
               ) : (
                 <div className="flex flex-col items-center">
                    <div className="w-20 h-20 rounded-2xl bg-slate-800 border border-white/5 flex items-center justify-center mb-6 text-slate-500">
                       <Radio size={32} />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Multimodal Interview</h3>
                    <p className="text-slate-400 max-w-xs mb-8">System analyzes verbal responses and non-verbal cues (Video & Audio).</p>
                    
                    {permissionError ? (
                        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl max-w-sm">
                           <div className="flex items-center gap-2 text-red-400 font-bold mb-2">
                             <AlertTriangle size={20} /> Permission Denied
                           </div>
                           <p className="text-xs text-slate-300 text-left">
                             Camera and Microphone access is required for this assessment. Please check your browser settings and try again.
                           </p>
                        </div>
                    ) : (
                      <button 
                        onClick={startSession}
                        disabled={connecting || !faceMeshLoaded}
                        className="px-8 py-3 bg-white text-black hover:bg-slate-200 rounded-xl font-bold text-lg shadow-xl shadow-white/10 transition-all disabled:opacity-50"
                      >
                        {connecting ? 'Connecting...' : faceMeshLoaded ? 'Begin Interview' : 'Initializing Vision Models...'}
                      </button>
                    )}
                 </div>
               )}
             </div>
          </div>

          {/* Transcript */}
          {active && (
             <div className="flex-1 bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-white/5 flex flex-col overflow-hidden shadow-2xl">
                <div className="p-4 bg-white/5 border-b border-white/5 flex items-center gap-2">
                   <MessageSquare size={16} className="text-blue-400" />
                   <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Live Transcript</span>
                </div>
                <div ref={transcriptContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                  {transcript.map((item, idx) => (
                    <div key={idx} className={`flex ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                        item.role === 'user' 
                          ? 'bg-blue-600 text-white rounded-br-none shadow-lg shadow-blue-900/20' 
                          : 'bg-slate-800 text-slate-200 rounded-bl-none border border-white/5'
                      }`}>
                        {item.text}
                      </div>
                    </div>
                  ))}
                </div>
             </div>
          )}
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default LiveInterview;