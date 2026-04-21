# CueHire — AI-Powered Tutor Screening

An AI voice interviewer platform that automates Cuemath tutor candidate screening. The system conducts natural voice conversations to assess communication clarity, patience, warmth, and teaching ability — then generates structured assessment reports for recruiters.

## 🎯 Problem

Screening hundreds of tutor candidates manually is time-consuming and inconsistent. CueHire replaces the initial screening round with an AI voice interviewer that:
- Conducts **natural, recruiter-like conversations** (not robotic Q&A)
- Evaluates **soft skills and teaching temperament** — not math knowledge
- Generates **detailed, structured assessments** with evidence quotes
- Provides **hire/no-hire recommendations** for each candidate

## ✨ Features

### For Candidates
- **AI Voice Interview** — Natural conversation with a warm, professional AI interviewer
- **Real-time Transcription** — Live transcript display during the interview
- **Instant Feedback** — Processing page with assessment generation

### For Recruiters (Admin Dashboard)
- **Candidate Assessments** — View all candidate evaluations
- **5-Dimension Scoring** — Communication Clarity, Patience & Empathy, Warmth, Ability to Simplify, English Fluency
- **Evidence-Based** — Direct quotes from interviews with analysis
- **Hire Recommendations** — Strong Hire / Hire / Maybe / No Hire

## 🏗️ Architecture

```
[Candidate] → [Firebase Auth] → [VAPI Voice Call] → [Deepgram Nova-3 STT]
     ↓                                                       ↓
[Interview Page]                                    [AI Interviewer (GPT-4)]
     ↓                                                       ↓
[End Call] → [Save Transcript] → [OpenAI Assessment] → [Firebase Firestore]
     ↓                                                       ↓
[Thank You Page]                                    [Admin Dashboard]
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15, React 19, TailwindCSS 4 |
| **Voice AI** | VAPI (voice orchestration) |
| **Transcription** | Deepgram Nova-3 |
| **AI Interviewer** | OpenAI GPT-4 |
| **Assessment** | OpenAI GPT-4o-mini (structured output) |
| **Auth** | Firebase Authentication |
| **Database** | Firebase Firestore |
| **Deployment** | Vercel |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- VAPI account (for voice)
- OpenAI API key
- Firebase project

### Setup

1. Clone the repository:
```bash
git clone https://github.com/adityarao3/cuehire.git
cd cuehire
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` with your credentials:
```env
NEXT_PUBLIC_VAPI_WEB_TOKEN=your_vapi_token
NEXT_PUBLIC_VAPI_WORKFLOW_ID=your_workflow_id

OPENAI_API_KEY=your_openai_key

NEXT_PUBLIC_BASE_URL=http://localhost:3000

NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="your_private_key"
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

### Admin Access
Sign up with email `admin@cuehire.com` to access the admin dashboard at `/admin`.

## 📐 Key Design Decisions

### Why VAPI for Voice?
VAPI handles the complex orchestration of real-time voice AI — managing WebRTC connections, voice activity detection, and turn-taking. This lets us focus on the interview logic rather than audio engineering.

### Why Dynamic Prompting over Static Questions?
Instead of a fixed question bank, the AI interviewer adapts dynamically based on candidate responses. This creates more natural conversations and reveals genuine communication patterns.

### Why Structured Output for Assessment?
Using OpenAI's structured output (via Vercel AI SDK) ensures assessments follow a consistent schema — making them comparable across candidates and reliable for the admin dashboard.

### Redirect-First Architecture
After the interview ends, we use hard browser redirects (`window.location.href`) instead of React Router navigation. This prevents React state lifecycle issues from blocking the critical transcript-saving step.

## 🔒 Security

- All API keys stored in server-side environment variables
- Firebase Admin SDK credentials never exposed to client
- Session-based authentication with HTTP-only cookies
- Admin access restricted to specific email address

## 📈 What I'd Improve With More Time

- **Recording Playback** — Store and replay voice recordings for recruiter review
- **Batch Screening** — Allow recruiters to invite multiple candidates via email
- **Comparative Analytics** — Dashboard comparing candidates side-by-side
- **Multi-language Support** — Hindi/regional language interview option
- **Custom Rubrics** — Let recruiters define their own evaluation criteria
- **Webhook Integration** — Notify recruiters via Slack/email when assessments are ready

## 📝 License

MIT
