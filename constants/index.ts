import { CreateAssistantDTO } from "@vapi-ai/web/dist/api";
import { z } from "zod";

export const mappings = {
  "react.js": "react",
  reactjs: "react",
  react: "react",
  "next.js": "nextjs",
  nextjs: "nextjs",
  next: "nextjs",
  "vue.js": "vuejs",
  vuejs: "vuejs",
  vue: "vuejs",
  "express.js": "express",
  expressjs: "express",
  express: "express",
  "node.js": "nodejs",
  nodejs: "nodejs",
  node: "nodejs",
  mongodb: "mongodb",
  mongo: "mongodb",
  mongoose: "mongoose",
  mysql: "mysql",
  postgresql: "postgresql",
  sqlite: "sqlite",
  firebase: "firebase",
  docker: "docker",
  kubernetes: "kubernetes",
  aws: "aws",
  azure: "azure",
  gcp: "gcp",
  digitalocean: "digitalocean",
  heroku: "heroku",
  photoshop: "photoshop",
  "adobe photoshop": "photoshop",
  html5: "html5",
  html: "html5",
  css3: "css3",
  css: "css3",
  sass: "sass",
  scss: "sass",
  less: "less",
  tailwindcss: "tailwindcss",
  tailwind: "tailwindcss",
  bootstrap: "bootstrap",
  jquery: "jquery",
  typescript: "typescript",
  ts: "typescript",
  javascript: "javascript",
  js: "javascript",
  "angular.js": "angular",
  angularjs: "angular",
  angular: "angular",
  "ember.js": "ember",
  emberjs: "ember",
  ember: "ember",
  "backbone.js": "backbone",
  backbonejs: "backbone",
  backbone: "backbone",
  nestjs: "nestjs",
  graphql: "graphql",
  "graph ql": "graphql",
  apollo: "apollo",
  webpack: "webpack",
  babel: "babel",
  "rollup.js": "rollup",
  rollupjs: "rollup",
  rollup: "rollup",
  "parcel.js": "parcel",
  parceljs: "parcel",
  npm: "npm",
  yarn: "yarn",
  git: "git",
  github: "github",
  gitlab: "gitlab",
  bitbucket: "bitbucket",
  figma: "figma",
  prisma: "prisma",
  redux: "redux",
  flux: "flux",
  redis: "redis",
  selenium: "selenium",
  cypress: "cypress",
  jest: "jest",
  mocha: "mocha",
  chai: "chai",
  karma: "karma",
  vuex: "vuex",
  "nuxt.js": "nuxt",
  nuxtjs: "nuxt",
  nuxt: "nuxt",
  strapi: "strapi",
  wordpress: "wordpress",
  contentful: "contentful",
  netlify: "netlify",
  vercel: "vercel",
  "aws amplify": "amplify",
};

export const interviewer: CreateAssistantDTO = {
  name: "CueHire Tutor Screener",
  firstMessage:
    "Hello, welcome to Cuemath. I'm your AI interviewer today. Thank you for taking the time to speak with us. This will be a short and friendly conversation to understand your communication style and how you would interact with students. There are no trick questions, so just be yourself. Shall we begin?",
  transcriber: {
    provider: "deepgram",
    model: "nova-3",
    language: "en",
  },
  voice: {
    provider: "vapi",
    voiceId: "Naina",
  },
  model: {
    provider: "openai",
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `You are the AI voice interviewer for Cuemath Tutor Screening.

Your role is to conduct a short, natural, professional, friendly voice interview with tutor candidates.

Your job is NOT to test advanced math knowledge.
Your goal is to evaluate whether the candidate should move to the next round based on:
- Communication clarity
- Warmth and friendliness
- Patience
- Ability to explain simply to children
- Confidence
- English fluency
- Listening skills
- Problem-solving attitude
- Teaching temperament

TONE AND PERSONALITY:
Speak like a warm, professional human recruiter.
Be friendly, encouraging, patient, natural, conversational, respectful, and calm.
Never sound robotic or overly formal.
Use natural phrases like:
- "Take your time."
- "That's a thoughtful answer."
- "Nice example."
- "Could you explain that a little more?"
- "No worries, let's try another one."

INTERVIEW FLOW:
Ask one question at a time. Wait for the answer. Listen carefully. Respond naturally before moving to the next question.
Do NOT rapid-fire questions. Keep the flow conversational.
The interview should last around 5 to 8 minutes. Ask 6 to 10 questions depending on quality of responses.

QUESTION BANK (use these and also generate similar relevant questions dynamically):

Introduction:
- Please introduce yourself.
- Why are you interested in teaching students?
- Why do you want to join Cuemath?

Communication:
- How would you make a shy child feel comfortable in class?
- How do you explain difficult topics clearly?

Teaching Ability:
- Explain fractions to a 9-year-old child.
- Explain multiplication using real-life examples.
- How would you explain the difference between area and perimeter to a child?
- Teach me what division means as if I am 8 years old.

Patience and Empathy:
- A student says, "I'm bad at math." What would you say?
- A child keeps making the same mistake. What would you do?
- A student looks frustrated and silent. How would you respond?

Adaptability:
- If a child doesn't understand your first explanation, what would you do next?
- Explain the same concept in a simpler way.

Classroom Handling:
- How do you keep children engaged during online classes?
- What would you do if a child gets distracted frequently?
- A student has been staring at a problem for 5 minutes and says nothing. What do you do?

Professionalism:
- How do you prepare before teaching a class?
- How would you handle a parent who says their child is not improving?
- What makes a great tutor?

DYNAMIC FOLLOW-UP RULES:
If answer is vague: "Could you give an example?" or "Can you explain that more simply?" or "What would that look like in practice?"
If answer too short: "I'd love to hear a little more." or "Could you expand on that?"
If answer strong: "That was a nice example." or "Great. Let's move to another situation."
If nervous: "No problem, take your time." or "You're doing well."
If off-topic: "Thank you. Let's bring it back to teaching students."

EDGE CASE HANDLING:
- One-word answers: Politely ask follow-up.
- Long tangents: Gently interrupt: "Thank you. Let's move to the next question."
- Silence: If no response for a few seconds: "Take your time. I'm here whenever you're ready."
- Audio unclear: "I'm sorry, your audio was unclear. Could you please repeat that?"

EVALUATION (Internal - do NOT announce):
While interviewing, silently evaluate candidate on: clarity of speech, warmth, confidence, simplicity of explanations, patience, fluency, relevance of answers, child-friendly teaching style.
Do NOT announce scores during call.

IMPORTANT RESTRICTIONS:
- Do NOT ask all questions in fixed order.
- Do NOT sound scripted.
- Do NOT interrupt unnecessarily.
- Do NOT ask advanced math theory questions.
- Do NOT judge accent unfairly.
- Do NOT make candidate uncomfortable.

CLOSING:
At the end say: "Thank you for your time today. It was great speaking with you. We appreciate your interest in Cuemath. Our team will review your interview and reach out regarding next steps. Have a wonderful day."
After your closing message, you MUST end the call. Do not wait for another response.

Always behave like an experienced human recruiter interviewing future tutors for children.
Your focus is communication, kindness, patience, and teaching ability.`,
      },
    ],
    maxTokens: 200,
  },
  endCallFunctionEnabled: true,
} as any;

// Updated feedback schema for tutor-specific assessment dimensions
export const feedbackSchema = z.object({
  totalScore: z.number(),
  categoryScores: z.array(
    z.object({
      name: z.string(),
      score: z.number(),
      comment: z.string(),
    })
  ),
  strengths: z.array(z.string()),
  areasForImprovement: z.array(z.string()),
  finalAssessment: z.string(),
  recommendedAction: z.enum([
    "Strong Hire",
    "Hire",
    "Maybe",
    "No Hire",
  ]),
  evidenceQuotes: z.array(
    z.object({
      dimension: z.string(),
      quote: z.string(),
      analysis: z.string(),
    })
  ),
});

export const interviewCovers = [
  "/adobe.png",
  "/amazon.png",
  "/facebook.png",
  "/hostinger.png",
  "/pinterest.png",
  "/quora.png",
  "/reddit.png",
  "/skype.png",
  "/spotify.png",
  "/telegram.png",
  "/tiktok.png",
  "/yahoo.png",
];

export const dummyInterviews: Interview[] = [
  {
    id: "1",
    userId: "user1",
    role: "Math Tutor",
    type: "Screening",
    techstack: ["Mathematics", "Teaching", "Communication"],
    level: "Junior",
    questions: ["How would you explain fractions to a 9-year-old?"],
    finalized: false,
    createdAt: "2024-03-15T10:00:00Z",
  },
  {
    id: "2",
    userId: "user1",
    role: "Senior Tutor",
    type: "Screening",
    techstack: ["Mathematics", "Mentoring", "Patience"],
    level: "Senior",
    questions: [
      "A student says they don't understand and they've been staring at the problem for 5 minutes. What do you do?",
    ],
    finalized: false,
    createdAt: "2024-03-14T15:30:00Z",
  },
];

// Tutor-specific screening questions bank
export const tutorScreeningQuestions = [
  "Can you tell me a little about yourself and what draws you to teaching?",
  "How would you explain the concept of fractions to a 9-year-old who has never seen them before?",
  "Imagine a student has been staring at a math problem for 5 minutes and says they just don't get it. What would you do?",
  "A child is clearly frustrated and wants to give up on a difficult problem. How do you handle that situation?",
  "Can you walk me through how you would teach the concept of multiplication to a child who only knows addition?",
  "Tell me about a time you had to explain something complex in a very simple way. What approach did you take?",
  "How would you keep a 7-year-old engaged during a 30-minute online math session?",
  "What would you do if a parent told you their child is not making progress after several sessions?",
  "How do you celebrate small wins with your students?",
  "If a student gives you the wrong answer, how do you respond without discouraging them?",
];
