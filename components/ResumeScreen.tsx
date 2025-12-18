import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertTriangle, XCircle, Loader2 } from 'lucide-react';
import { analyzeResume } from '../services/gemini';
import { CandidateProfile, JobContext } from '../types';

interface Props {
  onComplete: (profile: CandidateProfile) => void;
  jobContext: JobContext;
}

const ResumeScreen: React.FC<Props> = ({ onComplete, jobContext }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = (reader.result as string).split(',')[1];
        const mimeType = file.type;
        
        try {
          const profile = await analyzeResume(base64String, mimeType, jobContext);
          onComplete(profile);
        } catch (err) {
          setError("Failed to analyze resume. Please try a different file.");
        } finally {
          setLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError("Error reading file.");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 animate-fade-in">
      <div className="max-w-xl w-full bg-slate-800 rounded-2xl border border-slate-700 p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600/20 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Resume Intelligence</h2>
          <p className="text-slate-400">
            Analyzing fit for: <span className="text-white font-semibold">{jobContext.roleTitle}</span>
          </p>
        </div>

        <div 
          onClick={() => fileInputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300
            ${loading ? 'border-slate-600 bg-slate-800/50' : 'border-slate-600 hover:border-blue-500 hover:bg-slate-700/30'}
          `}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="application/pdf,image/png,image/jpeg"
            className="hidden" 
          />
          
          {loading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
              <p className="text-blue-400 font-medium">Analyzing against Job Description...</p>
              <p className="text-slate-500 text-sm mt-2">Checking gaps, tenure, and skill vectors.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Upload className="text-slate-400 mb-4" size={48} />
              <p className="text-white font-medium text-lg">Click to Upload Resume</p>
              <p className="text-slate-500 mt-2">PDF, JPEG, or PNG supported</p>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg flex items-center gap-3 text-red-400">
            <AlertTriangle size={20} />
            <p>{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeScreen;