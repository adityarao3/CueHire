"use server";

import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";

import { db } from "@/firebase/admin";
import { feedbackSchema } from "@/constants";
import { getCurrentUser } from "@/lib/actions/auth.action";

export async function createFeedback(params: CreateFeedbackParams) {
  let { interviewId, userId, transcript, feedbackId } = params;

  // If userId is not provided, get it from the current session
  if (!userId) {
    const user = await getCurrentUser();
    userId = user?.id || "";
  }

  try {
    // Handle empty transcript
    if (!transcript || transcript.length === 0) {
      console.error("createFeedback: transcript is empty");
      return { success: false, error: "No transcript data" };
    }

    console.log("createFeedback: starting with", transcript.length, "messages for interview", interviewId);

    const formattedTranscript = transcript
      .map(
        (sentence: { role: string; content: string }) =>
          `- ${sentence.role}: ${sentence.content}\n`
      )
      .join("");

    console.log("createFeedback: calling OpenAI...");

    const { object } = await generateObject({
      model: openai("gpt-4o"),
      schemaName: "feedback",
      schemaDescription: "Tutor candidate screening interview feedback",
      schema: feedbackSchema,
      prompt: `
You are a senior Cuemath recruitment evaluator. Analyze this tutor screening interview transcript and provide a precise, evidence-based assessment.

CONTEXT: This is a screening interview for tutoring children aged 6-16 in mathematics. You are assessing SOFT SKILLS and TEACHING TEMPERAMENT only — NOT math knowledge.

TRANSCRIPT:
${formattedTranscript}

SCORING GUIDELINES (be strict and calibrated — do NOT inflate scores):

Score each category from 0 to 100 using this rubric:
- 90-100: Exceptional — clear evidence of outstanding ability with multiple strong examples
- 75-89: Strong — good demonstration with some room for improvement
- 60-74: Adequate — meets basic expectations but notable gaps exist
- 40-59: Below Average — significant concerns that need development
- 0-39: Poor — major red flags or no evidence of this skill

CATEGORIES TO EVALUATE:

1. **Communication Clarity** (0-100)
   - Are their sentences structured and easy to follow?
   - Do they ramble or get to the point?
   - Can they organize their thoughts before speaking?
   - Do they use filler words excessively (um, uh, like)?
   - Would a child understand what they're saying?

2. **Patience and Empathy** (0-100)
   - Do they acknowledge when a question is difficult?
   - Do they show understanding of a child's perspective?
   - Would they stay calm if a student is frustrated or confused?
   - Do they demonstrate emotional intelligence in their responses?
   - Do they show genuine care about student wellbeing?

3. **Warmth and Approachability** (0-100)
   - Do they sound friendly and encouraging?
   - Would a shy child feel safe with this person?
   - Do they use positive language and tone?
   - Are they enthusiastic about teaching?
   - Do they create a comfortable conversation atmosphere?

4. **Ability to Simplify** (0-100)
   - Can they break down concepts into child-friendly language?
   - Do they use analogies, examples, or real-world connections?
   - Do they avoid jargon when explaining to hypothetical students?
   - Are their explanations age-appropriate?
   - Do they check for understanding in their approach?

5. **English Fluency** (0-100)
   - Is their grammar correct and natural?
   - Is their vocabulary appropriate for a teaching context?
   - Do they communicate confidently in English?
   - Can they express complex ideas clearly?
   - Is their language accessible for young learners?

IMPORTANT CALIBRATION RULES:
- If the interview was very short (< 5 exchanges), note this limitation and score conservatively
- Do NOT give high scores just because the candidate was polite — look for SPECIFIC evidence
- If a candidate gives generic/rehearsed answers without depth, score them in the 50-65 range
- Only give 85+ if there are genuinely impressive, specific, thoughtful responses
- The totalScore should be a weighted average reflecting overall impression, NOT a simple average
- Base your assessment ONLY on what the candidate actually said — do not assume or infer

EVIDENCE REQUIREMENTS:
- For each category, cite a SPECIFIC quote from the transcript
- Explain exactly what that quote reveals about the candidate
- If there's no relevant evidence for a category, state that and score conservatively (40-55)

RECOMMENDATION CRITERIA:
- "Strong Hire": Total 80+, no category below 70, multiple standout moments
- "Hire": Total 65-79, no category below 55, generally positive impression
- "Maybe": Total 50-64, mixed signals, some concerns but potential
- "No Hire": Total below 50, or any critical category below 35, or major red flags
`,
      system:
        "You are an experienced, strict but fair Cuemath senior recruiter. You have screened 500+ tutor candidates. You know exactly what makes a great children's tutor vs a mediocre one. You never inflate scores. You always back your assessment with evidence from the actual conversation. Your evaluations are trusted by the hiring team because they are precise and honest.",
    });

    console.log("createFeedback: OpenAI response received");

    const feedback = {
      interviewId: interviewId,
      userId: userId,
      totalScore: object.totalScore,
      categoryScores: object.categoryScores,
      strengths: object.strengths,
      areasForImprovement: object.areasForImprovement,
      finalAssessment: object.finalAssessment,
      recommendedAction: object.recommendedAction,
      evidenceQuotes: object.evidenceQuotes,
      createdAt: new Date().toISOString(),
    };

    let feedbackRef;

    if (feedbackId) {
      feedbackRef = db.collection("feedback").doc(feedbackId);
    } else {
      feedbackRef = db.collection("feedback").doc();
    }

    await feedbackRef.set(feedback);

    console.log("createFeedback: saved successfully with id", feedbackRef.id);
    return { success: true, feedbackId: feedbackRef.id };
  } catch (error: any) {
    console.error("Error in createFeedback:", error?.message || error);
    return { success: false, error: error?.message || "Unknown error" };
  }
}

export async function getInterviewById(id: string): Promise<Interview | null> {
  const interview = await db.collection("interviews").doc(id).get();

  return interview.data() as Interview | null;
}

export async function getFeedbackByInterviewId(
  params: GetFeedbackByInterviewIdParams
): Promise<Feedback | null> {
  const { interviewId, userId } = params;

  const querySnapshot = await db
    .collection("feedback")
    .where("interviewId", "==", interviewId)
    .where("userId", "==", userId)
    .limit(1)
    .get();

  if (querySnapshot.empty) return null;

  const feedbackDoc = querySnapshot.docs[0];
  return { id: feedbackDoc.id, ...feedbackDoc.data() } as Feedback;
}

export async function getLatestInterviews(
  params: GetLatestInterviewsParams
): Promise<Interview[] | null> {
  const { userId, limit = 20 } = params;

  const interviews = await db
    .collection("interviews")
    .orderBy("createdAt", "desc")
    .where("finalized", "==", true)
    .where("userId", "!=", userId)
    .limit(limit)
    .get();

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}

export async function getInterviewsByUserId(
  userId: string
): Promise<Interview[] | null> {
  const interviews = await db
    .collection("interviews")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}

// Admin-only: get all feedback for all candidates
export async function getAllFeedback(): Promise<Feedback[]> {
  const feedbackSnapshot = await db
    .collection("feedback")
    .orderBy("createdAt", "desc")
    .get();

  return feedbackSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Feedback[];
}

// Admin-only: get all interviews
export async function getAllInterviews(): Promise<Interview[]> {
  const interviewsSnapshot = await db
    .collection("interviews")
    .orderBy("createdAt", "desc")
    .get();

  return interviewsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}

// Get user by ID for admin dashboard
export async function getUserById(userId: string) {
  const userDoc = await db.collection("users").doc(userId).get();
  if (!userDoc.exists) return null;
  return { id: userDoc.id, ...userDoc.data() } as User;
}

// Create a minimal interview record to get an ID for saving feedback
// VAPI AI handles all questions dynamically — no questions stored here
export async function createScreeningInterview(userId: string) {
  const interviewRef = db.collection("interviews").doc();
  await interviewRef.set({
    userId,
    role: "Cuemath Tutor",
    type: "Screening",
    level: "Junior",
    techstack: ["Teaching", "Communication", "Patience"],
    questions: [],
    finalized: true,
    createdAt: new Date().toISOString(),
  });

  return { interviewId: interviewRef.id, questions: [] };
}
