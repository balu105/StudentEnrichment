import React, { useState } from 'react';
import { LayoutDashboard, FileText, Code2, Users, PieChart, ShieldCheck, Target, ChevronRight, Sparkles, LogOut, ArrowLeft } from 'lucide-react';
import { AppStage, CandidateProfile, CodeAssessmentResult, InterviewSessionData, FinalReportData, JobContext } from './types';
import ResumeScreen from './components/ResumeScreen';
import CodeAssessment from './components/CodeAssessment';
import LiveInterview from './components/LiveInterview';
import FinalReport from './components/FinalReport';
import JobSetup from './components/JobSetup';
import RecruiterDashboard from './components/RecruiterDashboard';
import LandingPage from './components/LandingPage';
import { generateFinalReport } from './services/gemini';
import { store } from './services/store';

const App: React.FC = () => {
  // View Modes: LANDING -> RECRUITER or CANDIDATE
  const [viewMode, setViewMode] = useState<'LANDING' | 'RECRUITER' | 'CANDIDATE'>('LANDING');
  // Track where the user came from to handle "Back" navigation correctly
  const [returnView, setReturnView] = useState<'LANDING' | 'RECRUITER'>('LANDING');
  const [stage, setStage] = useState<AppStage>(AppStage.DASHBOARD);
  
  // Active Assessment State
  const [currentCandidateId, setCurrentCandidateId] = useState<string | null>(null);
  const [jobContext, setJobContext] = useState<JobContext | null>(store.getJobContext());
  const [candidateProfile, setCandidateProfile] = useState<CandidateProfile | null>(null);
  const [codeResult, setCodeResult] = useState<CodeAssessmentResult | null>(null);
  const [interviewData, setInterviewData] = useState<InterviewSessionData | null>(null);
  const [finalReport, setFinalReport] = useState<FinalReportData | null>(null);
  const [generatingReport, setGeneratingReport] = useState(false);

  // --- Handlers ---

  const handleEnterRecruiter = () => {
    setViewMode('RECRUITER');
    setStage(AppStage.DASHBOARD);
  };

  const handleEnterCandidate = () => {
    // Entered via Student Portal -> Back button should go to Landing
    setReturnView('LANDING');
    
    // For demo purposes, we can start a fresh assessment flow or go to Setup
    // If no Job is defined, go to Setup (simulating a "Create Assessment" flow for demo)
    // In a real app, Candidate would enter a code. 
    setViewMode('CANDIDATE');
    setStage(AppStage.SETUP); 
  };

  const handleRunAssessment = (candidateId: string) => {
    // Entered via Recruiter Dashboard -> Back button should go to Recruiter
    setReturnView('RECRUITER');
    
    setCurrentCandidateId(candidateId);
    if (!jobContext) {
      setStage(AppStage.SETUP);
    } else {
      setStage(AppStage.RESUME);
    }
    setViewMode('CANDIDATE');
  };

  const handleViewReport = (candidateId: string) => {
    // Entered via Recruiter Dashboard -> Back button should go to Recruiter
    setReturnView('RECRUITER');
    
    const c = store.getCandidate(candidateId);
    if (c && c.technicalRound?.report) {
      setCurrentCandidateId(candidateId);
      setFinalReport(c.technicalRound.report);
      setCandidateProfile(c.resumeProfile || null);
      setCodeResult(c.technicalRound.codeResult || null);
      setInterviewData(c.technicalRound.interviewData || null);
      setStage(AppStage.REPORT);
      setViewMode('CANDIDATE');
    }
  };

  const handleJobSetupComplete = (context: JobContext) => {
    setJobContext(context);
    store.setJobContext(context);
    setStage(AppStage.RESUME);
  };

  const handleResumeComplete = (profile: CandidateProfile) => {
    setCandidateProfile(profile);
    if (currentCandidateId) {
      store.updateCandidateProgress(currentCandidateId, { resumeProfile: profile });
    }
    setStage(AppStage.CODE);
  };

  const handleCodeComplete = (result: CodeAssessmentResult) => {
    setCodeResult(result);
    if (currentCandidateId) {
      store.updateCandidateProgress(currentCandidateId, { 
        technicalRound: { ...store.getCandidate(currentCandidateId)?.technicalRound, codeResult: result } 
      });
    }
    setStage(AppStage.INTERVIEW);
  };

  const handleInterviewComplete = async (data: InterviewSessionData) => {
    setInterviewData(data);
    if (currentCandidateId) {
       store.updateCandidateProgress(currentCandidateId, { 
        technicalRound: { ...store.getCandidate(currentCandidateId)?.technicalRound, interviewData: data } 
      });
    }
    setGeneratingReport(true);
    setStage(AppStage.REPORT);
    
    if (candidateProfile && jobContext) {
      try {
        const report = await generateFinalReport(candidateProfile, codeResult, data, jobContext);
        setFinalReport(report);
        if (currentCandidateId) {
          store.updateCandidateProgress(currentCandidateId, {
            overallScore: report.overallScore,
            technicalRound: { ...store.getCandidate(currentCandidateId)?.technicalRound, report }
          });
        }
      } catch (e) {
        console.error("Report gen failed", e);
      } finally {
        setGeneratingReport(false);
      }
    }
  };

  const NavItem = ({ s, icon: Icon, label, disabled = false }: { s: AppStage, icon: any, label: string, disabled?: boolean }) => (
    <button
      onClick={() => !disabled && setStage(s)}
      disabled={disabled}
      className={`
        relative group flex items-center justify-center p-3 rounded-2xl transition-all duration-300 w-12 h-12 mb-4
        ${stage === s 
          ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.5)]' 
          : 'text-slate-500 hover:bg-white/10 hover:text-white'}
        ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <Icon size={20} />
      {/* Tooltip */}
      <span className="absolute left-16 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10 pointer-events-none z-50">
        {label}
      </span>
      {stage === s && (
        <span className="absolute -right-1 top-1 w-3 h-3 bg-blue-400 rounded-full border-2 border-slate-900"></span>
      )}
    </button>
  );

  // LANDING PAGE VIEW
  if (viewMode === 'LANDING') {
    return (
      <LandingPage 
        onEnterRecruiter={handleEnterRecruiter} 
        onEnterCandidate={handleEnterCandidate} 
      />
    );
  }

  // RECRUITER DASHBOARD VIEW
  if (viewMode === 'RECRUITER') {
    return (
      <div className="flex h-screen overflow-hidden font-sans bg-mesh text-slate-200">
        <div className="w-20 backdrop-blur-xl bg-slate-900/60 border-r border-white/5 flex flex-col items-center py-8 z-20">
          <div className="mb-10 p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg cursor-pointer" onClick={() => setViewMode('LANDING')}>
            <ShieldCheck size={24} className="text-white" />
          </div>
          <div className="flex-1 flex flex-col items-center">
            <button className="p-3 bg-blue-600 text-white rounded-2xl mb-4 shadow-[0_0_20px_rgba(37,99,235,0.5)]"><LayoutDashboard size={20} /></button>
          </div>
          <button onClick={() => setViewMode('LANDING')} className="mt-auto p-3 text-slate-500 hover:text-white"><LogOut size={20} /></button>
        </div>
        <div className="flex-1 relative">
           <RecruiterDashboard 
             onRunAssessment={handleRunAssessment} 
             onViewReport={handleViewReport} 
           />
        </div>
      </div>
    );
  }

  // CANDIDATE / ASSESSMENT VIEW
  return (
    <div className="flex h-screen overflow-hidden font-sans selection:bg-blue-500/30">
      {/* Glass Sidebar */}
      <div className="w-20 backdrop-blur-xl bg-slate-900/60 border-r border-white/5 flex flex-col items-center py-8 z-20">
        <div className="mb-10 p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg cursor-pointer" onClick={() => setViewMode('LANDING')}>
          <ShieldCheck size={24} className="text-white" />
        </div>
        
        <nav className="flex-1 flex flex-col items-center">
          <NavItem s={AppStage.DASHBOARD} icon={LayoutDashboard} label="Dashboard" disabled={true} />
          <NavItem s={AppStage.SETUP} icon={Target} label="Role Setup" disabled={stage === AppStage.DASHBOARD} />
          <NavItem s={AppStage.RESUME} icon={FileText} label="Resume Analysis" disabled={!jobContext} />
          <NavItem s={AppStage.CODE} icon={Code2} label="Coding Challenge" disabled={!candidateProfile} />
          <NavItem s={AppStage.INTERVIEW} icon={Users} label="AI Interview" disabled={!codeResult} />
          <NavItem s={AppStage.REPORT} icon={PieChart} label="Final Report" disabled={!interviewData} />
        </nav>

        <div className="mb-4">
           <button 
             onClick={() => setViewMode(returnView)} 
             className="p-2 text-slate-500 hover:text-white transition-colors"
             title={returnView === 'RECRUITER' ? "Back to Dashboard" : "Exit to Home"}
           >
             <LogOut size={20} />
           </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 relative flex flex-col">
        
        {/* Glass Header */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 backdrop-blur-md bg-slate-900/30 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setViewMode(returnView)} className="text-slate-500 hover:text-white transition-colors">
              <ArrowLeft size={20} />
            </button>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              AI-Driven <span className="text-blue-500">Job-Readiness System</span>
            </h2>
          </div>
          <div className="flex gap-4">
             {jobContext && (
               <div className="hidden md:flex items-center gap-3 bg-white/5 py-1.5 px-4 rounded-full border border-white/5 backdrop-blur-sm">
                 <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Target Role</span>
                 <div className="h-4 w-px bg-white/10"></div>
                 <span className="text-sm font-medium text-emerald-400">{jobContext.roleTitle}</span>
               </div>
             )}
             {currentCandidateId && (
               <div className="flex items-center gap-3 bg-white/5 py-1.5 px-4 rounded-full border border-white/5 backdrop-blur-sm">
                 <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                 <span className="text-sm font-medium text-white">{store.getCandidate(currentCandidateId)?.name}</span>
               </div>
             )}
          </div>
        </header>

        {/* Dynamic Content Area */}
        <div className="flex-1 overflow-y-auto relative">
          
          {/* Animated Background Blobs (Decoration) */}
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          
          <div className="relative z-10 h-full">
            {stage === AppStage.SETUP && <JobSetup onComplete={handleJobSetupComplete} />}
            {stage === AppStage.RESUME && jobContext && <ResumeScreen onComplete={handleResumeComplete} jobContext={jobContext} />}
            {stage === AppStage.CODE && jobContext && <CodeAssessment onComplete={handleCodeComplete} jobContext={jobContext} />}
            {stage === AppStage.INTERVIEW && candidateProfile && <LiveInterview onComplete={handleInterviewComplete} candidateName={candidateProfile.name} />}
            {stage === AppStage.REPORT && finalReport && <FinalReport data={finalReport} />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;