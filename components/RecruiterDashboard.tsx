import React, { useState, useEffect } from 'react';
import { Users, Search, Plus, MoreHorizontal, MessageSquare, AlertCircle, CheckCircle, Clock, ChevronRight, Play } from 'lucide-react';
import { Candidate, PipelineStage } from '../types';
import { store } from '../services/store';

interface Props {
  onRunAssessment: (candidateId: string) => void;
  onViewReport: (candidateId: string) => void;
}

const STAGES: PipelineStage[] = ['SCREENING', 'TECHNICAL_1', 'TECHNICAL_2', 'MANAGER_ROUND', 'HR_ROUND', 'OFFER'];

const RecruiterDashboard: React.FC<Props> = ({ onRunAssessment, onViewReport }) => {
  const [candidates, setCandidates] = useState<Candidate[]>(store.getAllCandidates());
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCandidate, setNewCandidate] = useState({ name: '', email: '', role: '' });

  useEffect(() => {
    // Poll for updates (mock realtime)
    const interval = setInterval(() => {
      setCandidates(store.getAllCandidates());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleAddCandidate = () => {
    if (newCandidate.name && newCandidate.role) {
      store.addCandidate(newCandidate.name, newCandidate.email, newCandidate.role);
      setCandidates(store.getAllCandidates());
      setShowAddModal(false);
      setNewCandidate({ name: '', email: '', role: '' });
    }
  };

  const handleMoveStage = (id: string, stage: PipelineStage) => {
    store.updateCandidateStage(id, stage);
    setCandidates(store.getAllCandidates());
  };

  const getStageColor = (stage: PipelineStage) => {
    switch (stage) {
      case 'SCREENING': return 'bg-slate-500';
      case 'TECHNICAL_1': return 'bg-blue-500';
      case 'TECHNICAL_2': return 'bg-indigo-500';
      case 'MANAGER_ROUND': return 'bg-purple-500';
      case 'HR_ROUND': return 'bg-pink-500';
      case 'OFFER': return 'bg-emerald-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className="h-full flex flex-col p-6 animate-fade-in overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Recruitment Pipeline</h1>
          <p className="text-slate-400">Manage candidates, orchestrate rounds, and track integrity.</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search candidates..." 
              className="bg-slate-900 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all"
          >
            <Plus size={18} /> Add Candidate
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-900/60 border border-white/5 p-4 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl"><Users size={24} /></div>
          <div>
            <div className="text-2xl font-bold text-white">{candidates.length}</div>
            <div className="text-xs text-slate-500 uppercase font-bold">Total Candidates</div>
          </div>
        </div>
        <div className="bg-slate-900/60 border border-white/5 p-4 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl"><CheckCircle size={24} /></div>
          <div>
            <div className="text-2xl font-bold text-white">{candidates.filter(c => c.status === 'HIRED').length}</div>
            <div className="text-xs text-slate-500 uppercase font-bold">Hired</div>
          </div>
        </div>
        <div className="bg-slate-900/60 border border-white/5 p-4 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-red-500/20 text-red-400 rounded-xl"><AlertCircle size={24} /></div>
          <div>
            <div className="text-2xl font-bold text-white">{candidates.filter(c => c.status === 'REJECTED').length}</div>
            <div className="text-xs text-slate-500 uppercase font-bold">Rejected</div>
          </div>
        </div>
         <div className="bg-slate-900/60 border border-white/5 p-4 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-orange-500/20 text-orange-400 rounded-xl"><Clock size={24} /></div>
          <div>
            <div className="text-2xl font-bold text-white">4.2 Days</div>
            <div className="text-xs text-slate-500 uppercase font-bold">Avg Time to Hire</div>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-4 h-full min-w-max pb-4">
          {STAGES.map(stage => (
            <div key={stage} className="w-80 flex flex-col">
              <div className={`flex items-center gap-2 mb-4 px-2`}>
                <div className={`w-2 h-2 rounded-full ${getStageColor(stage)}`}></div>
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">{stage.replace('_', ' ')}</h3>
                <span className="text-xs text-slate-500 bg-slate-900 px-2 py-0.5 rounded-full border border-white/5">
                  {candidates.filter(c => c.stage === stage).length}
                </span>
              </div>
              
              <div className="flex-1 bg-slate-900/30 border border-white/5 rounded-2xl p-3 space-y-3 overflow-y-auto">
                {candidates.filter(c => c.stage === stage).map(candidate => (
                  <div key={candidate.id} className="bg-slate-800/80 hover:bg-slate-800 border border-white/5 p-4 rounded-xl shadow-sm hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-white">{candidate.name}</h4>
                      <button className="text-slate-500 hover:text-white"><MoreHorizontal size={16} /></button>
                    </div>
                    <p className="text-xs text-slate-400 mb-3">{candidate.role}</p>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {candidate.tags.map(tag => (
                        <span key={tag} className="text-[10px] px-2 py-0.5 bg-blue-500/10 text-blue-300 rounded border border-blue-500/20">{tag}</span>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-4 pt-3 border-t border-white/5">
                      {candidate.overallScore > 0 ? (
                         <button 
                           onClick={() => onViewReport(candidate.id)}
                           className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs py-1.5 rounded-lg font-bold border border-emerald-500/20 transition-colors"
                         >
                           Score: {candidate.overallScore}
                         </button>
                      ) : (
                         <button 
                           onClick={() => onRunAssessment(candidate.id)}
                           className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs py-1.5 rounded-lg font-bold flex items-center justify-center gap-1 transition-colors"
                         >
                           <Play size={10} /> Run Test
                         </button>
                      )}
                      {stage !== 'OFFER' && (
                        <button 
                          onClick={() => handleMoveStage(candidate.id, STAGES[STAGES.indexOf(stage) + 1])}
                          className="bg-slate-700 hover:bg-slate-600 text-slate-300 p-1.5 rounded-lg"
                          title="Move to Next Round"
                        >
                          <ChevronRight size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Candidate Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-slate-900 border border-white/10 p-8 rounded-2xl w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-6">Add New Candidate</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                <input 
                  value={newCandidate.name} 
                  onChange={e => setNewCandidate({...newCandidate, name: e.target.value})}
                  className="w-full bg-slate-800 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500" 
                />
              </div>
              <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                 <input 
                   value={newCandidate.email} 
                   onChange={e => setNewCandidate({...newCandidate, email: e.target.value})}
                   className="w-full bg-slate-800 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500" 
                 />
              </div>
              <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Role / Job Title</label>
                 <input 
                   value={newCandidate.role} 
                   onChange={e => setNewCandidate({...newCandidate, role: e.target.value})}
                   className="w-full bg-slate-800 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500" 
                 />
              </div>
            </div>
            <div className="flex gap-4 mt-8">
              <button 
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-3 text-slate-400 hover:text-white font-bold"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddCandidate}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20"
              >
                Add Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruiterDashboard;
