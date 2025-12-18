# Veritas AI - The Brutally Honest Assessment Platform

Veritas AI is an autonomous, enterprise-grade hiring assessment ecosystem designed to replace subjective recruitment with brutal, data-driven precision. It orchestrates the entire hiring lifecycle—from role definition to final offer—using a multi-stage, strictly proctored AI pipeline.

## 🚀 Enterprise Core Modules

### 1. 🏢 Recruiter Command Center & Multi-Round Orchestration
*   **Kanban Pipeline Management**: Visualize candidates across distinct hiring stages (Screening, Technical Rounds, Managerial, HR).
*   **Pipeline Automation**: Drag-and-drop orchestration to move candidates between rounds.
*   **Candidate 360**: Centralized profile view containing resume data, assessment scores, and integrity logs.

### 2. 🎯 AI Role Calibration Engine
*   **AI Job Architect**: Instantly generates strict, industry-standard Job Descriptions (JDs) from a single title.
*   **Domain Specificity**: Automatically calibrates technical challenges based on the track:
    *   **Frontend**: React/UI Debounce & Component tasks.
    *   **Backend**: Rate Limiters & API Design.
    *   **Data Science**: Stream processing algorithms.
    *   **DevOps**: Log parsing & automation scripts.

### 3. 📄 Resume Intelligence 2.0
*   **Context-Aware Scoring**: Evaluates candidates specifically against the generated JD, not generic keywords.
*   **Red Flag Detector**: Auto-detects job hopping, employment gaps, and vague skill descriptions.
*   **Gap Analysis**: Identifies critical missing skills required for the specific role.

### 4. 💻 Dynamic Code Studio & Proctoring
*   **VS Code Experience**: A full-featured, syntax-highlighted editor environment.
*   **Real-Time Proctoring Layer**:
    *   **Focus Guard**: Detects and logs tab switching events with timestamped screenshots.
    *   **Clipboard Monitor**: Flags suspicious large copy-paste actions.
    *   **AI Code Reviewer**: Instantly evaluates Time Complexity (Big O), Code Quality, and Edge Cases.

### 5. 📹 Live Multimodal AI Interview (Gemini Live)
*   **Interviewer Persona**: "Sarah", a context-aware AI technical interviewer powered by **Gemini 2.5 Flash Native Audio**.
*   **Low-Latency Interaction**: Real-time, conversational audio/video interaction without transcription lag.
*   **Brutal Integrity Monitoring**:
    *   **Face Tracking**: Detects absence, multiple faces (impersonation), or looking away (gaze tracking).
    *   **Background Voice Detection**: Uses **Audio-Visual Correlation** (RMS + Mouth Landmarks) to detect whispering or coaching when the candidate is silent.

### 6. 📊 Executive Decision Intelligence
*   **Integrity Score**: A trust metric (0-100) heavily penalized by proctoring violations.
*   **Market Value Prediction**: Estimates salary range based on demonstrated skill depth.
*   **Attrition Risk Model**: Predicts likelihood of leaving based on historical patterns.
*   **Upskilling Roadmap**: Auto-generates a learning path for identified weaknesses.
*   **Psychometric Radar**: Visualizes personality traits (Big 5) derived from interview sentiment.

## 🛠 Tech Stack

*   **Frontend**: React 19, Tailwind CSS (Glassmorphism UI), Lucide Icons, Recharts.
*   **AI Core**: Google Gemini API (`@google/genai`).
    *   `gemini-2.5-flash`: Resume Parsing, Code Evaluation, JD Generation, Reporting.
    *   `gemini-2.5-flash-native-audio-preview`: Live Multimodal Interview.
*   **Computer Vision**: MediaPipe Face Mesh (Client-side real-time tracking).
*   **Audio Processing**: Web Audio API (Raw PCM streaming, RMS energy analysis).
*   **State Management**: Centralized Mock Store for candidate pipeline management.

## 🔑 Environment Setup

1.  **API Key**: The application requires a valid Google Gemini API key.
    *   It expects `process.env.API_KEY` to be available in the build environment.
    *   Ensure the key has access to `gemini-2.5-flash` and `gemini-2.5-flash-native-audio-preview`.

## 📦 Workflow

1.  **Recruiter Mode**: HR defines the role and manages the candidate pipeline in the Dashboard.
2.  **Assessment Initialization**: HR selects a candidate and launches the "Run Test" mode.
3.  **Resume Analysis**: AI scores the uploaded resume against the job constraints.
4.  **Technical Challenge**: Candidate solves a domain-specific problem under strict proctoring.
5.  **Live Interview**: AI conducts a behavioral and technical face-to-face interview.
6.  **Report Generation**: System compiles all data into a final "Hire/No-Hire" decision report.

---

*Built for the Google Gemini Developer Competition.*