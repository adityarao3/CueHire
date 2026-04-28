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

    // Calculate how much the user actually spoke
    const userSpeech = transcript
      .filter((m: any) => m.role === "user")
      .map((m: any) => m.content)
      .join(" ")
      .trim();
    const wordCount = userSpeech.split(/\s+/).filter((w: string) => w.length > 0).length;

    console.log("createFeedback: candidate spoke", wordCount, "words");

    // Tier 1: Almost no speech (< 5 words) → automatic 0
    if (wordCount < 5) {
      console.log("createFeedback: Candidate barely spoke, auto No Hire");
      const feedback = {
        interviewId, userId, totalScore: 0,
        categoryScores: [
          { category: "Communication Clarity", score: 0, comment: "Candidate did not provide enough speech to evaluate." },
          { category: "Patience and Empathy", score: 0, comment: "Candidate did not provide enough speech to evaluate." },
          { category: "Warmth and Approachability", score: 0, comment: "Candidate did not provide enough speech to evaluate." },
          { category: "Ability to Simplify", score: 0, comment: "Candidate did not provide enough speech to evaluate." },
          { category: "English Fluency", score: 0, comment: "Candidate did not provide enough speech to evaluate." },
        ],
        strengths: ["None observed — insufficient participation."],
        areasForImprovement: ["Candidate did not participate meaningfully in the interview."],
        finalAssessment: "The candidate spoke fewer than 5 words during the entire interview. No meaningful assessment can be made. This is an automatic rejection.",
        recommendedAction: "No Hire",
        evidenceQuotes: [{ category: "General", quote: userSpeech || "N/A", analysis: "Candidate provided virtually no speech to analyze." }],
        createdAt: new Date().toISOString(),
      };
      let feedbackRef = feedbackId ? db.collection("feedback").doc(feedbackId) : db.collection("feedback").doc();
      await feedbackRef.set(feedback);
      console.log("createFeedback: saved auto-reject with id", feedbackRef.id);
      return { success: true, feedbackId: feedbackRef.id };
    }

    // Tier 2: Very short speech (5-30 words) → auto low score, max 25
    if (wordCount < 30) {
      console.log("createFeedback: Very short conversation, auto low score");
      const feedback = {
        interviewId, userId, totalScore: Math.min(wordCount, 25),
        categoryScores: [
          { category: "Communication Clarity", score: Math.min(wordCount, 20), comment: `Candidate only spoke ${wordCount} words. Not enough data to assess communication skills properly.` },
          { category: "Patience and Empathy", score: Math.min(wordCount, 20), comment: `Insufficient speech to evaluate patience or empathy. Only ${wordCount} words spoken.` },
          { category: "Warmth and Approachability", score: Math.min(wordCount, 25), comment: `Too little interaction to assess warmth. Only ${wordCount} words spoken.` },
          { category: "Ability to Simplify", score: 0, comment: `No teaching or explanation was attempted. Only ${wordCount} words spoken.` },
          { category: "English Fluency", score: Math.min(wordCount, 30), comment: `Very limited speech sample (${wordCount} words). Cannot assess fluency reliably.` },
        ],
        strengths: ["None observed — conversation was too short to identify strengths."],
        areasForImprovement: ["Candidate needs to engage more fully in the interview.", "Very limited responses make evaluation impossible."],
        finalAssessment: `The candidate only spoke ${wordCount} words during the interview, which is far too little for a meaningful assessment. A tutor screening requires demonstrating communication skills, patience, and teaching ability through substantive responses. This candidate did not provide enough material to evaluate.`,
        recommendedAction: "No Hire",
        evidenceQuotes: [{ category: "General", quote: userSpeech, analysis: `Only ${wordCount} words were spoken. This is insufficient for any reliable assessment of teaching potential.` }],
        createdAt: new Date().toISOString(),
      };
      let feedbackRef = feedbackId ? db.collection("feedback").doc(feedbackId) : db.collection("feedback").doc();
      await feedbackRef.set(feedback);
      console.log("createFeedback: saved low-score feedback with id", feedbackRef.id);
      return { success: true, feedbackId: feedbackRef.id };
    }

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

CRITICAL CONTEXT: The candidate spoke a total of ${wordCount} words in this interview.

IMPORTANT CALIBRATION RULES:
- CONVERSATION LENGTH MATTERS:
  - If candidate spoke fewer than 50 words total: maximum totalScore is 30, recommend "No Hire"
  - If candidate spoke 50-100 words: maximum totalScore is 50, recommend "No Hire" or "Maybe" at best
  - If candidate spoke 100-200 words: score normally but note the limited sample size
  - Only candidates with 200+ words can potentially score above 70
- Do NOT give high scores just because the candidate was polite — look for SPECIFIC evidence
- If a candidate gives generic/rehearsed answers without depth, score them in the 30-45 range
- Only give 85+ if there are genuinely impressive, specific, thoughtful responses with depth
- The totalScore should be a weighted average reflecting overall impression, NOT a simple average
- Base your assessment ONLY on what the candidate actually said — do not assume or infer
- Short, vague, or one-word answers should be scored VERY LOW (10-25 per category)

EVIDENCE REQUIREMENTS:
- For each category, cite a SPECIFIC quote from the transcript
- Explain exactly what that quote reveals about the candidate
- If there's no relevant evidence for a category, state that and score between 10-20

RECOMMENDATION CRITERIA:
- "Strong Hire": Total 80+, no category below 70, multiple standout moments, 200+ words spoken
- "Hire": Total 65-79, no category below 55, generally positive impression, 150+ words spoken
- "Maybe": Total 50-64, mixed signals, some concerns but potential, 100+ words spoken
- "No Hire": Total below 50, or any critical category below 35, or major red flags, or fewer than 100 words spoken
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

// Admin-only: Assign a screening to a candidate by email
export async function assignScreeningToCandidate(candidateEmail: string) {
  // Verify admin
  const admin = await getCurrentUser();
  if (!admin || admin.email !== "admin@cuehire.com") {
    return { success: false, error: "Unauthorized" };
  }

  const email = candidateEmail.trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return { success: false, error: "Invalid email address" };
  }

  try {
    // Find user by email in Firestore
    const usersSnapshot = await db
      .collection("users")
      .where("email", "==", email)
      .limit(1)
      .get();

    let userId = "";
    let candidateName = "";

    if (!usersSnapshot.empty) {
      // User already registered
      const userDoc = usersSnapshot.docs[0];
      userId = userDoc.id;
      candidateName = userDoc.data().name || "";
    }

    // Create the screening interview assigned to this candidate
    const interviewRef = db.collection("interviews").doc();
    await interviewRef.set({
      userId,
      candidateEmail: email,
      candidateName,
      role: "Cuemath Tutor",
      type: "Screening",
      level: "Junior",
      techstack: ["Teaching", "Communication", "Patience"],
      questions: [],
      finalized: true,
      createdAt: new Date().toISOString(),
    });

    return {
      success: true,
      interviewId: interviewRef.id,
      candidateName: candidateName || email,
      alreadyRegistered: !usersSnapshot.empty,
    };
  } catch (error: any) {
    console.error("Error assigning screening:", error);
    return { success: false, error: error?.message || "Failed to assign screening" };
  }
}

// Get interviews assigned to a user (by userId OR email)
export async function getAssignedInterviews(userId: string, email: string) {
  try {
    // Get by userId
    const byUserId = await db
      .collection("interviews")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    // Get by email (for screenings assigned before user registered)
    // Use simple query without orderBy to avoid requiring composite index
    let byEmail;
    try {
      byEmail = await db
        .collection("interviews")
        .where("candidateEmail", "==", email.toLowerCase())
        .get();
    } catch {
      // If query fails, just use empty result
      byEmail = { docs: [] };
    }

    // Merge and deduplicate
    const interviewMap = new Map<string, Interview>();

    byUserId.docs.forEach((doc) => {
      interviewMap.set(doc.id, { id: doc.id, ...doc.data() } as Interview);
    });

    byEmail.docs.forEach((doc: any) => {
      if (!interviewMap.has(doc.id)) {
        interviewMap.set(doc.id, { id: doc.id, ...doc.data() } as Interview);

        // Also update the userId on the interview so future queries work by userId
        if (!doc.data().userId || doc.data().userId !== userId) {
          doc.ref.update({ userId });
        }
      }
    });

    return Array.from(interviewMap.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error("Error getting assigned interviews:", error);
    return [];
  }
}

