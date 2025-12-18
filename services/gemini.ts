import { GoogleGenAI, Type } from "@google/genai";
import { CandidateProfile, CodeAssessmentResult, FinalReportData, InterviewSessionData, JobContext } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateJobDescription = async (roleTitle: string): Promise<JobContext> => {
  const model = "gemini-2.5-flash";
  const prompt = `
    Act as an Expert Hiring Manager. Generate a strict, industry-standard Job Description for a "${roleTitle}".
    1. Summarize role responsibilities (2 sentences).
    2. List 5-7 key hard skills required.
    3. Define the experience level.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          roleTitle: { type: Type.STRING },
          description: { type: Type.STRING },
          requiredSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
          experienceLevel: { type: Type.STRING }
        }
      }
    }
  });

  if (response.text) {
    return JSON.parse(response.text) as JobContext;
  }
  throw new Error("Failed to generate JD");
};

export const analyzeResume = async (base64Data: string, mimeType: string, jobContext: JobContext): Promise<CandidateProfile> => {
  const model = "gemini-2.5-flash";
  
  const prompt = `
    Analyze this resume for the role: ${jobContext.roleTitle}.
    Context: ${jobContext.description}
    Required Skills: ${jobContext.requiredSkills.join(", ")}

    Evaluate the candidate's fit based on industry standards.
    Identify missing skills that are critical for this specific role.
    Provide a "resumeScore" (0-100).
    Identify any "flags" (gaps, vague descriptions).
  `;

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        { inlineData: { mimeType, data: base64Data } },
        { text: prompt }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          role: { type: Type.STRING },
          experience: { type: Type.STRING },
          resumeScore: { type: Type.NUMBER },
          skills: { type: Type.ARRAY, items: { type: Type.STRING } },
          missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
          flags: { type: Type.ARRAY, items: { type: Type.STRING } },
          summary: { type: Type.STRING }
        }
      }
    }
  });

  if (response.text) {
    return JSON.parse(response.text) as CandidateProfile;
  }
  throw new Error("Failed to analyze resume");
};

export const evaluateCode = async (code: string, problem: string): Promise<CodeAssessmentResult> => {
  const model = "gemini-2.5-flash";
  
  const prompt = `
    Evaluate this code solution for the problem: "${problem}".
    Code:
    ${code}

    Analyze:
    1. Correctness & Logic
    2. Time Complexity
    3. Code Cleanliness
    
    Score it 0-100. Be strict.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          timeComplexity: { type: Type.STRING },
          codeQuality: { type: Type.STRING },
          bugs: { type: Type.ARRAY, items: { type: Type.STRING } },
          feedback: { type: Type.STRING }
        }
      }
    }
  });

  if (response.text) {
    return { ...JSON.parse(response.text), integrityData: { tabSwitches: 0, copyPasteCount: 0, timeTakenSeconds: 0 } } as CodeAssessmentResult;
  }
  throw new Error("Failed to evaluate code");
};

export const generateFinalReport = async (
  candidate: CandidateProfile,
  codeResult: CodeAssessmentResult | null,
  interviewData: InterviewSessionData | null,
  jobContext: JobContext
): Promise<FinalReportData> => {
  const model = "gemini-2.5-flash";

  const interviewSummary = interviewData ? {
    transcriptSample: interviewData.transcript.slice(0, 40), // More context
    duration: interviewData.duration
  } : "No interview conducted";

  const integrityStats = codeResult ? codeResult.integrityData : { tabSwitches: 0, copyPasteCount: 0 };
  const proctoringEvents = interviewData ? interviewData.integrityEvents : [];

  const prompt = `
    Generate a comprehensive 'Job-Readiness & Hiring Assessment Report' for the role: ${jobContext.roleTitle}.
    
    Candidate Data: ${JSON.stringify(candidate)}
    Code Assessment: ${JSON.stringify(codeResult)}
    Proctoring & Integrity Logs: ${JSON.stringify(integrityStats)}
    Interview Proctoring: ${JSON.stringify(proctoringEvents)}
    Interview Transcript: ${JSON.stringify(interviewSummary)}

    **Task 1: Calculate Job-Readiness Index (JRI)**
    Calculate a single 0-100 score based on:
    - Resume Fit (20%)
    - Technical Proficiency (Code) (40%)
    - Communication & Behavior (Interview) (25%)
    - Integrity & Ethics (15%) (Deduct heavily for proctoring violations)

    **Task 2: Student Guidance**
    Provide a "trainingRecommendations" list. These should be specific, actionable steps for the student to improve their JRI score for this industry.

    Output JSON.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          overallScore: { type: Type.NUMBER, description: "The Job-Readiness Index (JRI)" },
          hiringRecommendation: { type: Type.STRING, enum: ["HIRE", "NO HIRE", "STRONG HIRE", "REJECT"] },
          integrityScore: { type: Type.NUMBER },
          attritionRisk: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH"] },
          salaryEstimation: { type: Type.STRING },
          trainingRecommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
          personalityTraits: { 
            type: Type.ARRAY, 
            items: { 
              type: Type.OBJECT, 
              properties: { name: { type: Type.STRING }, score: { type: Type.NUMBER } } 
            } 
          },
          communicationScore: { type: Type.NUMBER },
          technicalScore: { type: Type.NUMBER },
          culturalFitScore: { type: Type.NUMBER }
        }
      }
    }
  });

  const partialData = JSON.parse(response.text || '{}');

  return {
    candidate,
    codeResult,
    interviewData,
    jobContext,
    ...partialData
  };
};

export const getGeminiInstance = () => ai;