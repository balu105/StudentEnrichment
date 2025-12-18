import React from 'react';
import { ShieldCheck, BrainCircuit, Users, FileText, ArrowRight, Target, XCircle, CheckCircle2, GraduationCap } from 'lucide-react';

interface Props {
  onEnterRecruiter: () => void;
  onEnterCandidate: () => void;
}

const LandingPage: React.FC<Props> = ({ onEnterRecruiter, onEnterCandidate }) => {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-blue-500/30 overflow-x-hidden">
      
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-slate-900/50 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <ShieldCheck className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight leading-none">AI Assessment <span className="text-blue-500">System</span></h1>
              <p className="text-[10px] text-slate-400 font-medium tracking-widest uppercase">College Project Edition</p>
            </div>
          </div>
          <div className="flex gap-4">
             <button onClick={onEnterRecruiter} className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Admin Login</button>
             <button onClick={onEnterCandidate} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-bold border border-white/10 transition-all">Student Portal</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-8 animate-fade-in-up">
            <BrainCircuit size={14} /> Next-Gen Hiring Ecosystem
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-8 tracking-tight leading-tight animate-fade-in-up delay-100">
            AI-Driven Hiring & <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">Job-Readiness Assessment</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-3xl mx-auto leading-relaxed animate-fade-in-up delay-200">
            A unified platform replacing biased resumes and inconsistent interviews with 
            <span className="text-slate-200 font-semibold"> Resume Intelligence</span>, 
            <span className="text-slate-200 font-semibold"> Domain-Specific Testing</span>, and 
            <span className="text-slate-200 font-semibold"> Multimodal AI Interviews</span>. 
            Calculating a holistic <span className="text-emerald-400 font-bold">Job-Readiness Index (JRI)</span>.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-fade-in-up delay-300">
            <button 
              onClick={onEnterRecruiter}
              className="group relative px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-lg shadow-[0_0_40px_rgba(37,99,235,0.3)] transition-all overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">Recruiter Dashboard <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/></span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
            <button 
              onClick={onEnterCandidate}
              className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold text-lg border border-white/10 flex items-center gap-2 transition-all"
            >
              <Target size={20} className="text-emerald-400"/> Take Assessment
            </button>
          </div>
        </div>
      </section>

      {/* Problem vs Solution Grid */}
      <section className="py-20 px-6 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            
            {/* The Problem */}
            <div className="p-8 rounded-3xl bg-red-500/5 border border-red-500/10 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-red-500/20 rounded-xl text-red-400"><XCircle size={24} /></div>
                <h3 className="text-2xl font-bold text-white">The Current Challenge</h3>
              </div>
              <ul className="space-y-4 text-slate-400">
                <li className="flex gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2.5 shrink-0"></span>
                  <span><strong className="text-slate-300">Biased Filtering:</strong> Keyword-based ATS rejects qualified candidates.</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2.5 shrink-0"></span>
                  <span><strong className="text-slate-300">Inconsistent Interviews:</strong> Subjective human bias and lack of standardization.</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2.5 shrink-0"></span>
                  <span><strong className="text-slate-300">Cheating & Proxy:</strong> Easy to cheat in unproctored online coding tests.</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2.5 shrink-0"></span>
                  <span><strong className="text-slate-300">No Feedback:</strong> Students rejected without knowing their skill gaps.</span>
                </li>
              </ul>
            </div>

            {/* The Solution */}
            <div className="p-8 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 backdrop-blur-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-8 -mt-8"></div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400"><CheckCircle2 size={24} /></div>
                <h3 className="text-2xl font-bold text-white">The AI-Driven Solution</h3>
              </div>
              <ul className="space-y-4 text-slate-400">
                <li className="flex gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2.5 shrink-0"></span>
                  <span><strong className="text-slate-300">Holistic Assessment:</strong> Combines Resume, Code, and Interview into one pipeline.</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2.5 shrink-0"></span>
                  <span><strong className="text-slate-300">Job-Readiness Index (JRI):</strong> A single metric for employability.</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2.5 shrink-0"></span>
                  <span><strong className="text-slate-300">AI Proctoring:</strong> Tab-switch detection, gaze tracking, and voice analysis.</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2.5 shrink-0"></span>
                  <span><strong className="text-slate-300">Student Improvement:</strong> Personalized training paths to bridge gaps.</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* Modules/Features */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-white mb-16">Integrated Assessment Modules</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <FeatureCard 
            icon={<FileText />} 
            title="Resume Intelligence" 
            desc="Context-aware parsing that checks for true job fit, experience gaps, and missing critical skills."
            color="blue"
          />
          <FeatureCard 
            icon={<Target />} 
            title="Domain Testing" 
            desc="Adaptive coding challenges for Frontend, Backend, Data, and DevOps roles."
            color="purple"
          />
          <FeatureCard 
            icon={<Users />} 
            title="Multimodal Interview" 
            desc="AI interviewer 'Sarah' conducts real-time video interviews analyzing speech & body language."
            color="indigo"
          />
           <FeatureCard 
            icon={<GraduationCap />} 
            title="Student Guidance" 
            desc="Generates detailed feedback reports with actionable learning paths for students."
            color="emerald"
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-slate-600 text-sm border-t border-white/5 bg-slate-900/50">
        <p>AI-Driven Hiring and Job-Readiness Assessment System</p>
        <p className="mt-2">Built with React, Gemini 2.5 Flash, and MediaPipe.</p>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc, color }: { icon: any, title: string, desc: string, color: 'blue'|'purple'|'indigo'|'emerald' }) => {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-white/5 hover:bg-slate-800 transition-colors">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 border ${colorClasses[color]}`}>
        {React.cloneElement(icon, { size: 24 })}
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

export default LandingPage;