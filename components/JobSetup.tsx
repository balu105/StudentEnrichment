import React, { useState } from 'react';
import { Briefcase, ArrowRight, Loader2, Target, Code, Database, Server, Layout, Sparkles } from 'lucide-react';
import { generateJobDescription } from '../services/gemini';
import { JobContext, AssessmentDomain } from '../types';

interface Props {
  onComplete: (context: JobContext) => void;
}

const JobSetup: React.FC<Props> = ({ onComplete }) => {
  const [roleInput, setRoleInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedContext, setGeneratedContext] = useState<JobContext | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<AssessmentDomain>('GENERAL');
  const [isEditing, setIsEditing] = useState(false);
  const [editedContext, setEditedContext] = useState<Partial<JobContext>>({});

  const handleGenerate = async () => {
    if (!roleInput.trim()) return;
    setLoading(true);
    try {
      const context = await generateJobDescription(roleInput);
      setGeneratedContext({ ...context, domain: 'GENERAL' });
      setEditedContext({ ...context });
    } catch (e) {
      console.error(e);
      alert("Failed to generate Job Description");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (generatedContext) {
      onComplete({
        ...generatedContext,
        ...editedContext,
        description: editedContext.description || generatedContext.description,
        domain: selectedDomain,
        id: `job-${Date.now()}`
      } as JobContext);
    }
  };

  const domains: { id: AssessmentDomain; label: string; icon: any; color: string }[] = [
    { id: 'FRONTEND', label: 'Frontend / UI', icon: Layout, color: 'text-pink-400' },
    { id: 'BACKEND', label: 'Backend / API', icon: Server, color: 'text-blue-400' },
    { id: 'DATA', label: 'Data Science', icon: Database, color: 'text-emerald-400' },
    { id: 'DEVOPS', label: 'DevOps / Cloud', icon: Code, color: 'text-purple-400' },
    { id: 'GENERAL', label: 'General / DSA', icon: Target, color: 'text-orange-400' },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 animate-fade-in overflow-y-auto">
      <div className="max-w-4xl w-full bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/5 p-10 shadow-2xl my-auto relative overflow-hidden">
        {/* Decorative BG */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16"></div>

        <div className="relative z-10 text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-slate-300 mb-6">
             <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span> Step 1: Calibration
          </div>
          <h2 className="text-4xl font-bold text-white mb-3">Define the Target Role</h2>
          <p className="text-slate-400 max-w-lg mx-auto">The AI will generate a strict JD, calibrate technical questions, and set hiring benchmarks.</p>
        </div>

        {!generatedContext ? (
          <div className="max-w-xl mx-auto space-y-8">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative flex bg-slate-900 rounded-xl p-2 border border-white/10">
                <input
                  type="text"
                  value={roleInput}
                  onChange={(e) => setRoleInput(e.target.value)}
                  placeholder="e.g. Senior Backend Engineer"
                  className="flex-1 bg-transparent px-6 py-4 text-white placeholder-slate-500 focus:outline-none text-lg font-medium"
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                />
                <button
                  onClick={handleGenerate}
                  disabled={loading || !roleInput}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-8 rounded-lg font-bold flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <><Sparkles size={18} /> Generate</>}
                </button>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 justify-center">
              {['Full Stack Developer', 'Data Scientist', 'Product Manager', 'Site Reliability Engineer'].map(r => (
                <button 
                  key={r}
                  onClick={() => setRoleInput(r)}
                  className="text-xs bg-white/5 hover:bg-white/10 text-slate-300 px-4 py-2 rounded-full border border-white/5 transition-colors"
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in-up">
            {/* Domain Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 text-center">Select Assessment Track</label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {domains.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDomain(d.id)}
                    className={`group relative flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 overflow-hidden ${
                      selectedDomain === d.id 
                        ? 'bg-blue-600/20 border-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.3)]' 
                        : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
                    }`}
                  >
                    <div className={`p-3 rounded-full bg-slate-900 mb-3 ${d.color} shadow-lg group-hover:scale-110 transition-transform`}>
                      <d.icon size={24} />
                    </div>
                    <span className={`text-xs font-bold uppercase tracking-wide ${selectedDomain === d.id ? 'text-white' : 'text-slate-400'}`}>{d.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[#0f172a]/50 p-8 rounded-2xl border border-white/5 text-left">
              <div className="flex justify-between items-start mb-6">
                 <div>
                    <h3 className="text-2xl font-bold text-white mb-2">{generatedContext.roleTitle}</h3>
                    <div className="flex gap-2">
                       <span className="inline-block bg-emerald-500/10 text-emerald-400 text-xs px-2 py-1 rounded font-bold uppercase tracking-wider">
                         {generatedContext.experienceLevel}
                       </span>
                    </div>
                 </div>
                 <button 
                   onClick={() => setIsEditing(!isEditing)}
                   className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-slate-300 transition-all"
                 >
                   {isEditing ? 'Save Draft' : 'Edit Description'}
                 </button>
              </div>

              {isEditing ? (
                <textarea 
                  value={editedContext.description || generatedContext.description}
                  onChange={(e) => setEditedContext({...editedContext, description: e.target.value})}
                  className="w-full h-40 bg-slate-900 text-slate-200 text-sm p-4 rounded-xl border border-white/10 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 leading-relaxed"
                />
              ) : (
                <p className="text-slate-300 text-sm mb-6 leading-relaxed opacity-90">
                  {editedContext.description || generatedContext.description}
                </p>
              )}
              
              <div className="flex flex-wrap gap-2">
                {generatedContext.requiredSkills.map(s => (
                  <span key={s} className="px-3 py-1.5 bg-slate-900 text-slate-300 text-xs font-medium rounded-lg border border-white/5">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
               <button 
                onClick={() => setGeneratedContext(null)}
                className="flex-1 py-4 rounded-xl font-bold text-slate-400 hover:bg-white/5 transition-all"
              >
                Start Over
              </button>
              <button
                onClick={handleConfirm}
                className="flex-[2] bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 group transition-all"
              >
                Confirm & Initialize <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobSetup;
