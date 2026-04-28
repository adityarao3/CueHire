# CueHire — AI-Powered Tutor Screening Platform

**Project Title:** CueHire — AI Voice Interviewer for Automated Tutor Screening  
**Author:** Aditya Rao  
**Tech Stack:** Next.js 15 · React 19 · VAPI · OpenAI GPT-4 · Deepgram Nova-3 · Firebase · Vercel  
**GitHub:** github.com/adityarao3/cuehire

---

## 1. Problem Statement

Cuemath screens hundreds of tutor candidates every month. Each candidate must demonstrate soft skills — communication clarity, patience, warmth, and the ability to explain concepts simply to children aged 6–16. Traditionally, human recruiters conduct a 5–10 minute phone call for every applicant, which creates three problems:

1. **Scale** — A single recruiter can only handle a limited number of calls per day.
2. **Inconsistency** — Different recruiters weight different traits differently, leading to subjective and non-comparable evaluations.
3. **Turnaround** — Candidates often wait days before receiving a screening call, increasing drop-off rates.

CueHire solves all three by replacing the initial screening round with an **AI voice interviewer** that conducts natural, recruiter-like conversations and produces structured, evidence-based assessment reports — available to the hiring team within seconds of the call ending.

---

## 2. What CueHire Does

CueHire is a **full-stack web platform** that automates the first-round screening of Cuemath tutor candidates. The end-to-end flow is:

1. A candidate signs up and authenticates via Firebase.
2. The platform creates a screening interview record and drops the candidate into a **real-time voice call** with an AI interviewer.
3. The AI conducts a 5–8 minute conversation, dynamically adapting questions and follow-ups based on the candidate's responses.
4. Once the call ends, the full transcript is sent to GPT-4o, which generates a **structured assessment** — scoring the candidate across five dimensions, citing evidence quotes, and issuing a hire/no-hire recommendation.
5. Recruiters access an **admin dashboard** to review all candidate assessments, compare scores, read evidence-backed analysis, and make final decisions.

No manual screening call is needed. The entire pipeline — from candidate registration to recruiter-ready report — is automated.

---

## 3. Key Features

### For Candidates
- **AI Voice Interview** — A natural, warm, professional conversation powered by VAPI + OpenAI GPT-4. The AI speaks like an experienced recruiter, not a robot.
- **Real-time Transcription** — Deepgram Nova-3 transcribes the conversation live, displaying the latest exchange on screen so the candidate can follow along.
- **Seamless Flow** — One-click to start the call, automatic processing on call end, and a clear "Thank You" page once the assessment is submitted.

### For Recruiters (Admin Dashboard)
- **Candidate Assessment Cards** — Each candidate gets a card showing their name, email, overall score, category breakdown, recommendation badge (Strong Hire / Hire / Maybe / No Hire), and a brief summary.
- **5-Dimension Scoring (0–100 each):**
  - Communication Clarity
  - Patience and Empathy
  - Warmth and Approachability
  - Ability to Simplify
  - English Fluency
- **Full Assessment Reports** — Click into any candidate to see detailed per-category scores with score bars, written commentary, evidence quotes pulled directly from the transcript, strengths, areas for improvement, and the final assessment narrative.
- **Statistics Overview** — Dashboard header shows total assessments, recommended count, maybe count, not-recommended count, and average score across all candidates.

### Anti-Gaming & Calibration
- **Low-Effort Detection** — Candidates who speak fewer than 5 words get an automatic 0/100 score. Those under 30 words are capped at 25/100. This prevents gaming by joining and immediately leaving.
- **Word-Count-Aware Scoring** — The AI evaluator is explicitly told the candidate's word count and instructed to cap scores based on conversation length, preventing inflated scores from short, polite-but-empty interactions.

---

## 4. Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌──────────────────────┐
│  Candidate   │────▶│  Firebase Auth   │────▶│  Home Page (Next.js) │
│  (Browser)   │     │  (Sign Up/In)    │     │  "Begin Screening"   │
└─────────────┘     └──────────────────┘     └──────────┬───────────┘
                                                        │
                                                        ▼
                                             ┌──────────────────────┐
                                             │  /interview (SSR)    │
                                             │  Creates interview   │
                                             │  record in Firestore │
                                             └──────────┬───────────┘
                                                        │
                                                        ▼
                                             ┌──────────────────────┐
                                             │  /interview/[id]     │
                                             │  Agent Component     │
                                             │  ┌────────────────┐  │
                                             │  │  VAPI WebRTC   │  │
                                             │  │  Voice Call     │  │
                                             │  │  ┌──────────┐  │  │
                                             │  │  │Deepgram  │  │  │
                                             │  │  │Nova-3 STT│  │  │
                                             │  │  └──────────┘  │  │
                                             │  │  ┌──────────┐  │  │
                                             │  │  │GPT-4     │  │  │
                                             │  │  │Interview │  │  │
                                             │  │  │Brain     │  │  │
                                             │  │  └──────────┘  │  │
                                             │  └────────────────┘  │
                                             └──────────┬───────────┘
                                                        │ Call Ends
                                                        ▼
                                             ┌──────────────────────┐
                                             │  /interview/[id]/    │
                                             │  processing          │
                                             │  Sends transcript    │
                                             │  to GPT-4o for       │
                                             │  assessment          │
                                             └──────────┬───────────┘
                                                        │
                                                        ▼
                                             ┌──────────────────────┐
                                             │  Firebase Firestore  │
                                             │  - interviews        │
                                             │  - feedback          │
                                             │  - users             │
                                             └──────────┬───────────┘
                                                        │
                                                        ▼
                                             ┌──────────────────────┐
                                             │  /admin              │
                                             │  Admin Dashboard     │
                                             │  (admin@cuehire.com) │
                                             │  View all candidates │
                                             │  ┌────────────────┐  │
                                             │  │ /admin/feedback │  │
                                             │  │ /[feedbackId]   │  │
                                             │  │ Full Report     │  │
                                             │  └────────────────┘  │
                                             └──────────────────────┘
```

---

## 5. Tech Stack — Deep Dive

| Layer | Technology | Why This Choice |
|---|---|---|
| **Frontend** | Next.js 15 (App Router), React 19, TailwindCSS 4 | Server-side rendering for fast initial loads; App Router for file-based routing and server components; React 19 for latest features |
| **Voice Orchestration** | VAPI | Handles WebRTC connections, voice activity detection (VAD), and turn-taking out of the box — eliminates the need to build audio infrastructure from scratch |
| **Speech-to-Text** | Deepgram Nova-3 | Low-latency, high-accuracy transcription integrated directly through VAPI |
| **AI Interviewer** | OpenAI GPT-4 | Powers the conversational AI during the live call — generates dynamic questions, follow-ups, and natural recruiter-like responses |
| **Assessment Engine** | OpenAI GPT-4o via Vercel AI SDK (`generateObject`) | Analyzes the full transcript post-call and produces structured JSON output matching a Zod schema — ensures consistent, machine-readable assessments |
| **Authentication** | Firebase Authentication | Email/password auth with session cookies (HTTP-only, 1-week expiry) managed via Firebase Admin SDK on the server |
| **Database** | Firebase Firestore | Three collections: `users`, `interviews`, `feedback` — NoSQL document store for flexible schema and real-time reads |
| **Deployment** | Vercel | Zero-config deployment for Next.js with edge functions, environment variable management, and automatic HTTPS |

---

## 6. How the AI Interview Works — Step by Step

### Step 1: Candidate Authentication
The candidate visits the platform and signs up with name, email, and password. Firebase Authentication creates the user record, and a server-side session cookie is set via `auth.createSessionCookie()`. All subsequent requests are authenticated by verifying this cookie.

### Step 2: Interview Creation
When the candidate clicks "Begin Your Screening," the `/interview` page (a server component) calls `createScreeningInterview(userId)`, which:
- Creates a new document in the `interviews` Firestore collection
- Sets `role: "Cuemath Tutor"`, `type: "Screening"`, `finalized: true`
- Returns the auto-generated `interviewId`
- Immediately redirects to `/interview/[interviewId]`

### Step 3: Voice Call via VAPI
The `Agent` component (client-side) initializes a VAPI voice call using the `@vapi-ai/web` SDK. The call is configured with:
- **Transcriber:** Deepgram Nova-3 (English)
- **Voice:** VAPI's "Naina" voice — warm and professional
- **Model:** GPT-4 with a detailed system prompt

The system prompt instructs GPT-4 to:
- Act as a warm, professional Cuemath recruiter
- Ask 6–10 questions from a curated bank across 7 categories (introduction, communication, teaching ability, patience/empathy, adaptability, classroom handling, professionalism)
- Dynamically adapt follow-ups: ask for examples when answers are vague, reassure when the candidate is nervous, gently redirect when they go off-topic
- End the call naturally after the conversation is complete

### Step 4: Real-Time Transcript Capture
During the call, VAPI fires `message` events with transcript data. The `Agent` component captures all `final` transcripts and stores them in React state (with a ref backup for reliability). The latest message is displayed on screen with a fade-in animation.

### Step 5: Call End & Transcript Saving
When the call ends (either the AI finishes or the candidate clicks "End"):
1. The `call-end` event fires
2. A 2-second buffer waits for any final transcript fragments
3. The full transcript array is saved to `sessionStorage`
4. A hard redirect (`window.location.href`) navigates to `/interview/[id]/processing`

The hard redirect (instead of React Router) is a deliberate design decision — it prevents React state lifecycle issues from blocking the critical transcript-saving step.

### Step 6: AI Assessment Generation
The processing page reads the transcript from `sessionStorage` and calls the `createFeedback` server action, which:

1. **Checks word count** — If the candidate spoke fewer than 5 words, it auto-generates a 0/100 "No Hire" assessment. If under 30 words, it caps the score at 25.

2. **Formats the transcript** — Converts the message array into a readable format: `- user: [message]` / `- assistant: [message]`

3. **Calls GPT-4o** — Using Vercel AI SDK's `generateObject()` with a Zod schema (`feedbackSchema`), it sends:
   - The formatted transcript
   - A detailed evaluation prompt with scoring rubrics (0–100 per category)
   - Calibration rules tied to word count
   - Evidence requirements (must cite specific quotes)
   - Recommendation criteria (Strong Hire / Hire / Maybe / No Hire)

4. **Saves to Firestore** — The structured response is stored in the `feedback` collection with: `interviewId`, `userId`, `totalScore`, `categoryScores`, `strengths`, `areasForImprovement`, `finalAssessment`, `recommendedAction`, `evidenceQuotes`, and `createdAt`

### Step 7: Recruiter Review
Admin users (identified by email `admin@cuehire.com`) access the `/admin` dashboard, which:
- Fetches all feedback documents, ordered by creation date
- Enriches each with candidate name/email and interview metadata
- Displays summary cards with score, category bars, recommendation badge, and a "View Full Report" button
- The full report page (`/admin/feedback/[feedbackId]`) shows the complete assessment with score bars, evidence quotes (rendered as styled blockquotes), strengths, and areas for improvement

---

## 7. Scoring & Calibration System

### Five Assessment Dimensions

| Dimension | What It Measures |
|---|---|
| **Communication Clarity** | Sentence structure, organization of thoughts, avoiding filler words, clarity for children |
| **Patience and Empathy** | Acknowledging difficulty, child's perspective, emotional intelligence, genuine care |
| **Warmth and Approachability** | Friendliness, encouraging tone, positive language, creating safe atmosphere |
| **Ability to Simplify** | Breaking down concepts, using analogies and examples, age-appropriate language |
| **English Fluency** | Grammar, vocabulary, confidence, expressing complex ideas clearly |

### Scoring Rubric (per category, 0–100)

| Score Range | Meaning |
|---|---|
| 90–100 | Exceptional — clear evidence of outstanding ability with multiple strong examples |
| 75–89 | Strong — good demonstration with some room for improvement |
| 60–74 | Adequate — meets basic expectations but notable gaps exist |
| 40–59 | Below Average — significant concerns that need development |
| 0–39 | Poor — major red flags or no evidence of this skill |

### Word-Count Calibration Tiers

| Words Spoken | Maximum Score | Recommendation Cap |
|---|---|---|
| < 5 | 0 | Automatic No Hire |
| 5–30 | 25 | Automatic No Hire |
| 30–50 | 30 | No Hire |
| 50–100 | 50 | No Hire or Maybe |
| 100–200 | Normal | Normal (with disclaimer) |
| 200+ | 100 | Full range available |

### Recommendation Thresholds

| Recommendation | Criteria |
|---|---|
| **Strong Hire** | Total 80+, no category below 70, 200+ words spoken |
| **Hire** | Total 65–79, no category below 55, 150+ words spoken |
| **Maybe** | Total 50–64, mixed signals, 100+ words spoken |
| **No Hire** | Below 50, any critical category below 35, major red flags, or fewer than 100 words |

---

## 8. Application Routes & Page Structure

| Route | Type | Description |
|---|---|---|
| `/sign-in` | Auth | Email/password sign-in page |
| `/sign-up` | Auth | Registration page (name, email, password) |
| `/` | Home | Hero section, screening history, available screenings |
| `/interview` | SSR Redirect | Creates interview record, redirects to `/interview/[id]` |
| `/interview/[id]` | Client | Voice call page with Agent component |
| `/interview/[id]/processing` | Client | Post-call assessment generation with loading UI |
| `/interview/[id]/feedback` | SSR | Candidate's view of their assessment results |
| `/admin` | SSR (Protected) | Recruiter dashboard — all candidates and scores |
| `/admin/feedback/[feedbackId]` | SSR (Protected) | Detailed assessment report for a specific candidate |

---

## 9. Security

- **Server-side API keys** — OpenAI key and Firebase Admin credentials are stored in server-side environment variables, never exposed to the client.
- **HTTP-only session cookies** — Authentication uses `httpOnly` cookies with 1-week expiry, created via Firebase Admin SDK's `createSessionCookie()`. Cookies are `secure` in production and `sameSite: lax`.
- **Admin access control** — The admin dashboard and feedback detail pages check `user.email === "admin@cuehire.com"` on every request. Unauthorized users are redirected to home.
- **Server Components** — All data fetching happens in Next.js server components, so database queries and API calls never run in the browser.

---

## 10. Key Design Decisions

### Why VAPI for Voice?
Building real-time voice AI from scratch requires WebRTC connection management, voice activity detection, echo cancellation, and turn-taking logic. VAPI abstracts all of this into a single SDK call, letting us focus entirely on the interview conversation design.

### Why Dynamic Prompting Over Static Questions?
A fixed question list makes the conversation feel robotic. Instead, GPT-4 receives a question bank and a set of behavioral rules (follow up on vague answers, praise strong ones, reassure nervous candidates). This creates a natural conversation flow that reveals genuine communication patterns — exactly what you'd want when evaluating soft skills.

### Why Structured Output for Assessment?
Using `generateObject()` with a Zod schema guarantees the AI response matches a fixed structure — `totalScore`, `categoryScores[]`, `strengths[]`, `evidenceQuotes[]`, etc. This makes assessments machine-readable, consistently formatted, and directly renderable in the admin UI without any parsing or transformation.

### Why Hard Redirects Instead of React Router?
After the call ends, the transcript must be saved to `sessionStorage` before navigation. React Router's client-side navigation can trigger component unmounts and state cleanup before the save completes. A hard `window.location.href` redirect ensures the save happens synchronously before the browser navigates away.

### Why Word-Count Tiers?
Without word-count awareness, GPT-4o tends to be generous — it can produce a 60/100 score for a candidate who only said "Hello, yes, thank you, bye." The tiered system enforces that meaningful evaluation requires meaningful participation.

---

## 11. Firestore Data Model

### `users` Collection
```json
{
  "name": "string",
  "email": "string"
}
```

### `interviews` Collection
```json
{
  "userId": "string",
  "role": "Cuemath Tutor",
  "type": "Screening",
  "level": "Junior",
  "techstack": ["Teaching", "Communication", "Patience"],
  "questions": [],
  "finalized": true,
  "createdAt": "ISO 8601 timestamp"
}
```

### `feedback` Collection
```json
{
  "interviewId": "string",
  "userId": "string",
  "totalScore": 0-100,
  "categoryScores": [
    { "name": "Communication Clarity", "score": 0-100, "comment": "string" }
  ],
  "strengths": ["string"],
  "areasForImprovement": ["string"],
  "finalAssessment": "string",
  "recommendedAction": "Strong Hire | Hire | Maybe | No Hire",
  "evidenceQuotes": [
    { "dimension": "string", "quote": "string", "analysis": "string" }
  ],
  "createdAt": "ISO 8601 timestamp"
}
```

---

## 12. Future Improvements

- **Recording Playback** — Store and replay voice recordings so recruiters can listen to the actual conversation, not just read transcripts.
- **Batch Screening** — Allow recruiters to invite multiple candidates via email with unique screening links.
- **Comparative Analytics** — Dashboard for comparing candidates side-by-side across all dimensions.
- **Multi-Language Support** — Hindi and regional language interview options for candidates more comfortable in their native language.
- **Custom Rubrics** — Let recruiters define their own evaluation criteria and scoring weights.
- **Webhook Notifications** — Slack/email alerts when a new assessment is ready for review.
- **Candidate Re-screening** — Allow candidates to retake the screening after a cooldown period.
- **Interview Analytics** — Track average interview duration, common question paths, and scoring distributions over time.

---

## 13. How to Run Locally

### Prerequisites
- Node.js 18+
- VAPI account with Web Token and Workflow ID
- OpenAI API key
- Firebase project with Auth and Firestore enabled

### Setup

```bash
git clone https://github.com/adityarao3/cuehire.git
cd cuehire
npm install
```

Create `.env.local`:
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

```bash
npm run dev
```

Open http://localhost:3000. Sign up with `admin@cuehire.com` to access the admin dashboard.

---

*Built with Next.js, OpenAI, VAPI, Deepgram, and Firebase.*
