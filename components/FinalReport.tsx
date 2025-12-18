import React from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { FinalReportData } from '../types';
import { Award, ShieldCheck, Download, DollarSign, TrendingUp, ShieldAlert, GraduationCap, BookOpen, BrainCircuit, CheckCircle2 } from 'lucide-react';

interface Props {
  data: FinalReportData;
}

const FinalReport: React.FC<Props> = ({ data }) => {
  const { 
    candidate, 
    codeResult, 
    overallScore, // This is JRI
    hiringRecommendation, 
    personalityTraits, 
    communicationScore, 
    technicalScore, 
    integrityScore,
    salaryEstimation,
    attritionRisk,
    trainingRecommendations,
    jobContext
  } = data;

  // Pillars Data
  const pillarsData = [
    { name: 'Resume Fit', score: candidate.resumeScore || 0, fill: '#60a5fa', weight: '20%' },
    { name: 'Technical', score: technicalScore, fill: '#3b82f6', weight: '40%' },
    { name: 'Comm. Skills', score: communicationScore, fill: '#8b5cf6', weight: '25%' },
    { name: 'Integrity', score: integrityScore, fill: integrityScore > 80 ? '#10b981' : '#ef4444', weight: '15%' },
  ];

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8 animate-fade-in pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-2">
         <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-4">
              <Award size={14} /> Official Assessment Report
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">{candidate.name}</h1>
            <p className="text-slate-400 text-lg">Target Role: <span className="text-emerald-400 font-medium">{jobContext.roleTitle}</span></p>
         </div>
         <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-6 py-3 rounded-xl font-medium transition-all">
             <Download size={18} /> Export PDF
         </button>
      </div>

      {/* JRI Score Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Main Score Card */}
         <div className="lg:col-span-1 bg-gradient-to-br from-slate-900 to-blue-950 rounded-3xl p-1 border border-blue-500/30 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl pointer-events-none -mr-8 -mt-8"></div>
            <div className="bg-[#0f172a] h-full rounded-[20px] p-8 flex flex-col items-center justify-center text-center relative z-10">
              <div className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4">Job-Readiness Index (JRI)</div>
              <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 mb-2">
                 {overallScore}
              </div>
              <p className="text-slate-500 text-sm mb-6 max-w-[200px]">Consolidated score measuring holistic employability for this specific role.</p>
              
              <div className={`px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider shadow-lg border ${
                hiringRecommendation.includes('HIRE') 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                  : 'bg-red-500/10 text-red-400 border-red-500/20'
              }`}>
                {hiringRecommendation}
              </div>
            </div>
         </div>

         {/* 4 Pillars Breakdown */}
         <div className="lg:col-span-2 bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-3xl p-8 flex flex-col justify-center">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <BrainCircuit size={20} className="text-purple-400" /> Assessment Components
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {pillarsData.map((item) => (
                <div key={item.name} className="bg-slate-800/50 rounded-2xl p-4 border border-white/5 relative overflow-hidden group hover:bg-slate-800 transition-colors">
                   <div className="flex justify-between items-start mb-2">
                      <span className="text-xs text-slate-400 font-bold uppercase">{item.name}</span>
                      <span className="text-[10px] text-slate-500 bg-black/30 px-1.5 py-0.5 rounded">{item.weight}</span>
                   </div>
                   <div className="text-3xl font-bold text-white mb-2">{item.score}</div>
                   <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${item.score}%`, backgroundColor: item.fill }}></div>
                   </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 pt-6 border-t border-white/5 grid grid-cols-3 gap-4">
                <div className="text-center border-r border-white/5 last:border-0">
                    <div className="text-xs text-slate-500 uppercase font-semibold mb-1">Market Salary</div>
                    <div className="text-white font-bold">{salaryEstimation}</div>
                </div>
                <div className="text-center border-r border-white/5 last:border-0">
                    <div className="text-xs text-slate-500 uppercase font-semibold mb-1">Attrition Risk</div>
                    <div className="text-white font-bold">{attritionRisk}</div>
                </div>
                 <div className="text-center border-r border-white/5 last:border-0">
                    <div className="text-xs text-slate-500 uppercase font-semibold mb-1">Integrity Flags</div>
                    <div className={`font-bold ${codeResult?.integrityData.tabSwitches ? 'text-red-400' : 'text-emerald-400'}`}>
                        {codeResult?.integrityData.tabSwitches || 0}
                    </div>
                </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Charts */}
         <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 p-6 rounded-3xl h-full flex flex-col">
               <h3 className="text-lg font-bold text-white mb-6">Personality & Behavior</h3>
               <div className="h-64 w-full flex-1">
                 <ResponsiveContainer width="100%" height="100%">
                   <RadarChart cx="50%" cy="50%" outerRadius="70%" data={personalityTraits}>
                     <PolarGrid stroke="#334155" />
                     <PolarAngleAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} />
                     <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                     <Radar name="Candidate" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.4} />
                   </RadarChart>
                 </ResponsiveContainer>
               </div>
            </div>
         </div>

         {/* Student Improvement Plan */}
         <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 p-8 rounded-3xl border-l-4 border-l-emerald-500">
               <div className="flex items-center justify-between mb-2">
                 <h3 className="text-xl font-bold text-white flex items-center gap-2">
                   <GraduationCap className="text-emerald-500" /> Student Improvement Plan
                 </h3>
                 <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded border border-emerald-500/20">Personalized Guidance</span>
               </div>
               <p className="text-slate-400 text-sm mb-6">AI-generated roadmap to bridge skill gaps and increase Job-Readiness Index.</p>
               
               <div className="space-y-4">
                  {trainingRecommendations?.map((rec, i) => (
                    <div key={i} className="flex gap-4 items-start p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                       <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                         {i+1}
                       </div>
                       <div>
                         <p className="text-slate-300 text-sm leading-relaxed">{rec}</p>
                       </div>
                    </div>
                  ))}
               </div>

               <div className="mt-8 pt-6 border-t border-white/10">
                   <h4 className="text-sm font-bold text-slate-500 uppercase mb-4">Critical Missing Skills</h4>
                   <div className="flex flex-wrap gap-2">
                      {candidate.missingSkills.length > 0 ? candidate.missingSkills.map(s => (
                        <span key={s} className="px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-xs font-semibold">
                          {s}
                        </span>
                      )) : <span className="text-slate-500 text-sm italic">No critical gaps identified.</span>}
                   </div>
               </div>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 p-8 rounded-3xl">
               <div className="flex items-center gap-2 mb-4 text-slate-400">
                 <BookOpen size={18} />
                 <h3 className="text-sm font-bold uppercase tracking-wider">Technical Feedback</h3>
               </div>
               <div className="bg-[#0d1117] p-6 rounded-xl border border-white/10 font-mono text-sm text-slate-300 leading-relaxed shadow-inner">
                  <p className="opacity-80">"{codeResult?.feedback}"</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default FinalReport;