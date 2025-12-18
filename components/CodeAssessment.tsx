import React, { useState, useEffect, useRef } from 'react';
import { Code2, Send, AlertCircle, Eye, EyeOff, ShieldAlert, Cpu, Terminal, Play } from 'lucide-react';
import { evaluateCode } from '../services/gemini';
import { CodeAssessmentResult, JobContext, AssessmentDomain } from '../types';

interface Props {
  onComplete: (result: CodeAssessmentResult) => void;
  jobContext: JobContext;
}

const PROBLEMS: Record<AssessmentDomain, { title: string, description: string, boilerplate: string }> = {
  GENERAL: {
    title: "Valid Anagram",
    description: `Given two strings s and t, return true if t is an anagram of s, and false otherwise.
    
    Example 1:
    Input: s = "anagram", t = "nagaram"
    Output: true
    
    Constraints:
    1 <= s.length, t.length <= 5 * 10^4`,
    boilerplate: `function isAnagram(s, t) {
  // Your code here
  
}`
  },
  FRONTEND: {
    title: "Implement Debounce",
    description: `Implement a debounce function that limits the rate at which a function can fire.
    
    The function should take two arguments:
    1. fn: The function to debounce
    2. delay: The delay in milliseconds
    
    The returned function should cancel any scheduled execution if called again within the delay window.`,
    boilerplate: `function debounce(fn, delay) {
  // Your implementation here
  
}`
  },
  BACKEND: {
    title: "Rate Limiter Middleware",
    description: `Design a simple in-memory rate limiter function for an API.
    
    The function should accept a userId (string) and return true if the request is allowed, or false if limited.
    Limit: 5 requests per 10 seconds.
    
    Assume this function is called on every request.`,
    boilerplate: `const requestCounts = {};

function isAllowed(userId) {
  // Your implementation here
  
}`
  },
  DATA: {
    title: "Moving Average from Stream",
    description: `Given a stream of integers and a window size, calculate the moving average of all integers in the sliding window.
    
    Implement the 'next(val)' method which returns the current average.`,
    boilerplate: `class MovingAverage {
  constructor(size) {
    this.size = size;
    // Initialize storage
  }

  next(val) {
    // Returns number
  }
}`
  },
  DEVOPS: {
    title: "Log Parsing Utility",
    description: `Write a script to parse a raw log line and extract the IP address, Timestamp, and Status Code.
    
    Log Format:
    "192.168.1.1 - [10/Oct/2023:13:55:36 +0000] 'GET /api/v1/status' 200 2326"
    
    Return a JSON object.`,
    boilerplate: `function parseLogLine(log) {
  // Regex parsing logic here
  
}`
  }
};

const CodeAssessment: React.FC<Props> = ({ onComplete, jobContext }) => {
  const problem = PROBLEMS[jobContext.domain] || PROBLEMS.GENERAL;
  
  const [code, setCode] = useState(problem.boilerplate);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [copyPasteCount, setCopyPasteCount] = useState(0);
  const startTimeRef = useRef(Date.now());
  const [showWarning, setShowWarning] = useState(false);

  // Fake line numbers for the IDE look
  const lineNumbers = code.split('\n').map((_, i) => i + 1).join('\n');

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitches(prev => prev + 1);
        setShowWarning(true);
        setTimeout(() => setShowWarning(false), 4000);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const handleCopyPaste = (e: React.ClipboardEvent) => {
    setCopyPasteCount(prev => prev + 1);
    setShowWarning(true);
    setTimeout(() => setShowWarning(false), 3000);
  };

  const handleSubmit = async () => {
    if (!code || code === problem.boilerplate) return;
    setIsEvaluating(true);
    
    const timeTaken = (Date.now() - startTimeRef.current) / 1000;
    
    try {
      const rawResult = await evaluateCode(code, problem.title);
      const result: CodeAssessmentResult = {
        ...rawResult,
        integrityData: {
          tabSwitches,
          copyPasteCount,
          timeTakenSeconds: timeTaken
        }
      };
      onComplete(result);
    } catch (e) {
      console.error(e);
      alert("Evaluation failed. Please try again.");
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="h-full flex flex-col md:flex-row p-6 gap-6 max-w-[1600px] mx-auto animate-fade-in">
      {/* Proctoring Warning Overlay */}
      {showWarning && (
        <div className="fixed top-10 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-red-500 text-white px-8 py-4 rounded-xl shadow-[0_0_40px_rgba(239,68,68,0.6)] animate-bounce flex items-center gap-3 font-bold border-2 border-red-400">
            <ShieldAlert size={28} />
            <div className="flex flex-col">
              <span className="uppercase tracking-wider text-xs opacity-90">Proctoring Alert</span>
              <span>Suspicious Activity Detected</span>
            </div>
          </div>
        </div>
      )}

      {/* Problem Pane */}
      <div className="md:w-[400px] flex flex-col gap-4">
        <div className="flex-1 bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/5 flex flex-col overflow-hidden shadow-2xl">
          <div className="p-4 border-b border-white/5 flex items-center gap-2 bg-white/5">
            <Code2 className="text-blue-400" size={18} />
            <h3 className="font-semibold text-white text-sm">Problem Description</h3>
          </div>
          <div className="p-6 overflow-y-auto flex-1 text-slate-300 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30 font-mono">
                {jobContext.domain}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                Medium
              </span>
            </div>
            <h2 className="text-xl font-bold text-white">{problem.title}</h2>
            <div className="prose prose-invert prose-sm max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed bg-transparent p-0 text-slate-300">
                {problem.description}
              </pre>
            </div>
          </div>
          
          {/* Integrity Stats Mini-panel */}
          <div className="p-4 border-t border-white/5 bg-black/20">
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="text-slate-500 font-semibold uppercase">Session Integrity</span>
              {tabSwitches === 0 && copyPasteCount === 0 ? (
                <span className="text-emerald-500 flex items-center gap-1"><Eye size={12}/> Secure</span>
              ) : (
                <span className="text-red-400 flex items-center gap-1"><ShieldAlert size={12}/> Flagged</span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-800 rounded p-2 flex flex-col items-center">
                 <span className={`font-mono text-lg font-bold ${tabSwitches > 0 ? 'text-red-400' : 'text-slate-400'}`}>{tabSwitches}</span>
                 <span className="text-[10px] text-slate-500 uppercase">Focus Loss</span>
              </div>
              <div className="bg-slate-800 rounded p-2 flex flex-col items-center">
                 <span className={`font-mono text-lg font-bold ${copyPasteCount > 0 ? 'text-red-400' : 'text-slate-400'}`}>{copyPasteCount}</span>
                 <span className="text-[10px] text-slate-500 uppercase">Paste Events</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Editor Pane */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        <div className="flex-1 bg-[#0d1117] rounded-2xl border border-white/10 overflow-hidden flex flex-col shadow-2xl relative group">
          
          {/* Editor Header */}
          <div className="h-10 bg-[#161b22] border-b border-white/5 flex items-center justify-between px-4">
             <div className="flex items-center gap-2">
               <div className="flex gap-1.5 group-hover:opacity-100 opacity-50 transition-opacity">
                 <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                 <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                 <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
               </div>
               <span className="ml-4 text-xs text-slate-400 font-mono">solution.js</span>
             </div>
             <div className="flex items-center gap-3">
               <span className="text-[10px] text-slate-500 uppercase tracking-wider flex items-center gap-1">
                 <Cpu size={12} /> AI Proctor Active
               </span>
             </div>
          </div>

          <div className="flex-1 flex relative">
            {/* Line Numbers */}
            <div className="w-12 bg-[#0d1117] text-slate-600 text-right pr-3 pt-4 font-mono text-sm select-none border-r border-white/5 leading-6">
              {lineNumbers}
            </div>

            {/* Textarea overlay */}
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onPaste={handleCopyPaste}
              onCopy={handleCopyPaste}
              className="flex-1 w-full h-full bg-[#0d1117] text-slate-200 p-4 pt-4 font-mono text-sm resize-none focus:outline-none leading-6 selection:bg-blue-500/30"
              spellCheck={false}
              style={{ fontFamily: '"JetBrains Mono", monospace' }}
            />

            {isEvaluating && (
              <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                 <div className="relative">
                   <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                 </div>
                 <p className="text-lg font-semibold text-white mt-4">Analyzing Solution...</p>
                 <div className="flex gap-2 text-slate-400 text-sm mt-2">
                   <span className="animate-pulse">Checking Complexity</span> • 
                   <span className="animate-pulse delay-75">Running Test Cases</span>
                 </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center bg-slate-900/40 p-3 rounded-xl border border-white/5 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-slate-400 text-xs px-2">
             <Terminal size={14} />
             <span>Console Output: Ready</span>
          </div>
          <button
            onClick={handleSubmit}
            disabled={isEvaluating}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isEvaluating ? 'Evaluating...' : (
              <>
                <Play size={16} fill="currentColor" /> Run & Submit
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CodeAssessment;
