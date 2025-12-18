export enum AppStage {
  SETUP = 'SETUP',
  DASHBOARD = 'DASHBOARD',
  RESUME = 'RESUME',
  CODE = 'CODE',
  INTERVIEW = 'INTERVIEW',
  REPORT = 'REPORT'
}

export type AssessmentDomain = 'FRONTEND' | 'BACKEND' | 'DATA' | 'DEVOPS' | 'GENERAL';

export type PipelineStage = 'SCREENING' | 'TECHNICAL_1' | 'TECHNICAL_2' | 'MANAGER_ROUND' | 'HR_ROUND' | 'OFFER' | 'REJECTED';

export interface JobContext {
  id?: string;
  roleTitle: string;
  description: string;
  requiredSkills: string[];
  experienceLevel: string;
  domain: AssessmentDomain;
}

export interface RecruiterNote {
  id: string;
  author: string;
  text: string;
  timestamp: number;
}

export interface CandidateProfile {
  name: string;
  role: string;
  experience: string;
  resumeScore?: number;
  skills: string[];
  missingSkills: string[];
  flags: string[];
  summary: string;

  // Assessment & Report Metrics
  overallScore?: number;
  hiringRecommendation?: 'HIRE' | 'NO HIRE' | 'STRONG HIRE' | 'REJECT';
  integrityScore?: number;
  salaryEstimation?: string;
  attritionRisk?: 'LOW' | 'MEDIUM' | 'HIGH';
  culturalFitScore?: number;
}

export interface CodeAssessmentResult {
  score: number;
  timeComplexity: string;
  codeQuality: string;
  bugs: string[];
  feedback: string;
  integrityData: {
    tabSwitches: number;
    copyPasteCount: number;
    timeTakenSeconds: number;
  };
}

export interface InterviewSessionData {
  transcript: { role: 'user' | 'model'; text: string }[];
  duration: number;
  videoSnapshots: string[]; 
  integrityEvents: { timestamp: number; type: 'NO_FACE' | 'MULTIPLE_FACES' | 'LOOKING_AWAY' | 'TAB_SWITCH' | 'BACKGROUND_VOICE' }[];
}

export interface FinalReportData {
  candidate: CandidateProfile;
  codeResult: CodeAssessmentResult | null;
  interviewData: InterviewSessionData | null;
  jobContext: JobContext;
  
  // Scoring
  overallScore: number;
  hiringRecommendation: 'HIRE' | 'NO HIRE' | 'STRONG HIRE' | 'REJECT';
  integrityScore: number; 
  
  // Deep Insights
  salaryEstimation: string;
  attritionRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  culturalFitScore: number;
  technicalScore: number;
  communicationScore: number;
  
  personalityTraits: { name: string; score: number }[];
  trainingRecommendations: string[]; 
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  role: string; // Job Title
  stage: PipelineStage;
  status: 'ACTIVE' | 'REJECTED' | 'HIRED';
  
  // Data accumulated over rounds
  resumeProfile?: CandidateProfile;
  technicalRound?: {
    codeResult?: CodeAssessmentResult;
    interviewData?: InterviewSessionData;
    report?: FinalReportData;
  };
  
  overallScore: number;
  notes: RecruiterNote[];
  tags: string[];
  jobId?: string;
}
