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

    console.log("createFeedback: calling Gemini...");

    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      schemaName: "feedback",
      schemaDescription: "Tutor candidate screening interview feedback",
      schema: feedbackSchema,
      prompt: `
        You are evaluating a Cuemath tutor candidate screening interview. This is NOT a math knowledge test — you are assessing their SOFT SKILLS and TEACHING TEMPERAMENT for tutoring children aged 6-16.
        
        Be thorough and detailed in your analysis. Be fair but honest — point out weaknesses alongside strengths. Use specific quotes from the transcript as evidence for your assessments.

        Transcript:
        ${formattedTranscript}

        Please score the candidate from 0 to 100 in the following areas. Do not add categories other than the ones provided:
        - **Communication Clarity**: Can they articulate thoughts clearly and coherently? Are their explanations structured and easy to follow?
        - **Patience and Empathy**: Do they show understanding toward struggling students? Would they stay calm and supportive when a child is frustrated?
        - **Warmth and Approachability**: Would a child feel comfortable and safe with this person? Do they come across as friendly and encouraging?
        - **Ability to Simplify**: Can they break down complex math concepts into simple, child-friendly explanations? Do they use relatable analogies?
        - **English Fluency**: Are they comfortable speaking in English? Is their grammar and vocabulary appropriate for a teaching context?
        
        For each category, include a detailed comment with specific observations.
        
        Also provide:
        - A list of strengths (specific things they did well)
        - A list of areas for improvement (specific things to work on)
        - A final assessment paragraph summarizing the overall evaluation
        - A recommended action: "Strong Hire", "Hire", "Maybe", or "No Hire"
        - Evidence quotes: For each assessment dimension, pull a specific quote from the transcript and analyze what it reveals about the candidate
        `,
      system:
        "You are a senior Cuemath recruitment evaluator analyzing a tutor candidate screening interview. Your evaluation will help determine if this candidate should move to the next round. Be thorough, fair, and use evidence from the conversation.",
    });

    console.log("createFeedback: Gemini response received");

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
