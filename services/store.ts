import { Candidate, FinalReportData, JobContext, PipelineStage } from "../types";

// Mock Database
class RecruitmentStore {
  private candidates: Candidate[] = [
    {
      id: 'c1',
      name: 'Alex Chen',
      email: 'alex@example.com',
      role: 'Senior React Developer',
      stage: 'TECHNICAL_1',
      status: 'ACTIVE',
      overallScore: 0,
      notes: [],
      tags: ['Top Talent', 'React Expert'],
    },
    {
      id: 'c2',
      name: 'Sarah Jones',
      email: 'sarah@example.com',
      role: 'Backend Engineer',
      stage: 'SCREENING',
      status: 'ACTIVE',
      overallScore: 0,
      notes: [],
      tags: [],
    },
    {
      id: 'c3',
      name: 'Michael Ross',
      email: 'mike@example.com',
      role: 'Data Scientist',
      stage: 'MANAGER_ROUND',
      status: 'ACTIVE',
      overallScore: 88,
      tags: ['Strong Communicator'],
      notes: [{ id: 'n1', author: 'HR', text: 'Great culture fit', timestamp: Date.now() }]
    }
  ];

  private activeJob: JobContext | null = null;

  getAllCandidates(): Candidate[] {
    return [...this.candidates];
  }

  getCandidate(id: string): Candidate | undefined {
    return this.candidates.find(c => c.id === id);
  }

  addCandidate(name: string, email: string, role: string): Candidate {
    const newCandidate: Candidate = {
      id: `c${Date.now()}`,
      name,
      email,
      role,
      stage: 'SCREENING',
      status: 'ACTIVE',
      overallScore: 0,
      notes: [],
      tags: []
    };
    this.candidates.push(newCandidate);
    return newCandidate;
  }

  updateCandidateStage(id: string, stage: PipelineStage) {
    const c = this.candidates.find(x => x.id === id);
    if (c) c.stage = stage;
  }

  updateCandidateStatus(id: string, status: 'ACTIVE' | 'REJECTED' | 'HIRED') {
    const c = this.candidates.find(x => x.id === id);
    if (c) c.status = status;
  }

  updateCandidateProgress(id: string, data: Partial<Candidate>) {
    const idx = this.candidates.findIndex(c => c.id === id);
    if (idx !== -1) {
      this.candidates[idx] = { ...this.candidates[idx], ...data };
    }
  }

  setJobContext(job: JobContext) {
    this.activeJob = job;
  }

  getJobContext(): JobContext | null {
    return this.activeJob;
  }
}

export const store = new RecruitmentStore();
