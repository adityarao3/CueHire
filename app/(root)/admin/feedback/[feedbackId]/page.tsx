import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);
import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  getInterviewById,
  getUserById,
} from "@/lib/actions/general.action";
import { db } from "@/firebase/admin";

const AdminFeedbackDetail = async ({ params }: RouteParams) => {
  const { feedbackId } = await params;
  const user = await getCurrentUser();

  // Only admin can access
  if (!user || user.email !== "admin@cuehire.com") {
    redirect("/");
  }

  // Get the feedback document
  const feedbackDoc = await db.collection("feedback").doc(feedbackId).get();
  if (!feedbackDoc.exists) redirect("/admin");

  const feedback = { id: feedbackDoc.id, ...feedbackDoc.data() } as Feedback;

  // Get related interview and candidate info
  const interview = feedback.interviewId
    ? await getInterviewById(feedback.interviewId)
    : null;
  const candidate = feedback.userId
    ? await getUserById(feedback.userId)
    : null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success-100";
    if (score >= 60) return "text-yellow-400";
    if (score >= 40) return "text-orange-400";
    return "text-destructive-100";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-success-100";
    if (score >= 60) return "bg-yellow-400";
    if (score >= 40) return "bg-orange-400";
    return "bg-destructive-100";
  };

  const getActionColor = (action?: string) => {
    switch (action) {
      case "Strong Hire":
        return "bg-success-100 text-dark-100";
      case "Hire":
        return "bg-success-100/60 text-white";
      case "Maybe":
        return "bg-yellow-500/60 text-white";
      case "No Hire":
        return "bg-destructive-100/60 text-white";
      default:
        return "bg-dark-200 text-light-100";
    }
  };

  return (
    <section className="section-feedback">
      {/* Back Button */}
      <div>
        <Button className="btn-secondary" asChild>
          <Link href="/admin">
            <p className="text-sm font-semibold text-primary-200">
              ← Back to Dashboard
            </p>
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="bg-destructive-100/20 text-destructive-100 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Admin Report
          </span>
          <span
            className={`px-4 py-1.5 rounded-full text-sm font-bold ${getActionColor(
              feedback.recommendedAction
            )}`}
          >
            {feedback.recommendedAction || "Pending"}
          </span>
        </div>

        <h1 className="text-4xl font-semibold">
          Screening Report —{" "}
          <span className="text-primary-200">
            {candidate?.name || "Unknown Candidate"}
          </span>
        </h1>

        <div className="flex flex-wrap gap-5 text-sm text-light-400">
          <span>📧 {candidate?.email || "N/A"}</span>
          <span>
            💼{" "}
            {interview?.role
              ? `${interview.role} — ${interview.type}`
              : "Screening"}
          </span>
          <span>
            📅{" "}
            {feedback.createdAt
              ? dayjs.utc(feedback.createdAt).tz("Asia/Kolkata").format("MMM D, YYYY h:mm A") + " IST"
              : "N/A"}
          </span>
        </div>
      </div>

      {/* Overall Score */}
      <div className="flex flex-col items-center gap-2 py-6">
        <span className={`text-6xl font-bold ${getScoreColor(feedback.totalScore)}`}>
          {feedback.totalScore}
        </span>
        <span className="text-light-400">Overall Score /100</span>
      </div>

      <hr />

      {/* Final Assessment */}
      <div>
        <h2 className="mb-3">Final Assessment</h2>
        <p className="text-light-100 leading-relaxed">{feedback.finalAssessment}</p>
      </div>

      {/* Category Breakdown */}
      <div className="flex flex-col gap-5">
        <h2>Assessment Breakdown</h2>
        {feedback.categoryScores?.map((category, index) => (
          <div key={index} className="bg-dark-200/50 rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="font-bold text-lg text-white">
                {index + 1}. {category.name}
              </p>
              <span
                className={`text-2xl font-bold ${getScoreColor(category.score)}`}
              >
                {category.score}/100
              </span>
            </div>
            {/* Score Bar */}
            <div className="w-full bg-dark-100 rounded-full h-2 mb-3">
              <div
                className={`h-2 rounded-full ${getScoreBg(category.score)} transition-all`}
                style={{ width: `${category.score}%` }}
              />
            </div>
            <p className="text-light-100 text-sm leading-relaxed">{category.comment}</p>
          </div>
        ))}
      </div>

      {/* Evidence Quotes */}
      {feedback.evidenceQuotes && feedback.evidenceQuotes.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2>Evidence from Conversation</h2>
          {feedback.evidenceQuotes.map((eq, index) => (
            <div
              key={index}
              className="bg-dark-200/30 rounded-xl p-5 border-l-4 border-primary-200"
            >
              <p className="text-xs text-primary-200 font-bold uppercase tracking-wider mb-2">
                {eq.dimension}
              </p>
              <blockquote className="text-light-100 italic border-none pl-0 mb-2">
                &ldquo;{eq.quote}&rdquo;
              </blockquote>
              <p className="text-sm text-light-400">{eq.analysis}</p>
            </div>
          ))}
        </div>
      )}

      {/* Strengths */}
      <div className="flex flex-col gap-3">
        <h3 className="text-success-100">✅ Strengths</h3>
        <ul>
          {feedback.strengths?.map((strength, index) => (
            <li key={index} className="text-light-100">{strength}</li>
          ))}
        </ul>
      </div>

      {/* Areas for Improvement */}
      <div className="flex flex-col gap-3">
        <h3 className="text-yellow-400">⚠️ Areas for Improvement</h3>
        <ul>
          {feedback.areasForImprovement?.map((area, index) => (
            <li key={index} className="text-light-100">{area}</li>
          ))}
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="buttons">
        <Button className="btn-secondary flex-1">
          <Link href="/admin" className="flex w-full justify-center">
            <p className="text-sm font-semibold text-primary-200 text-center">
              Back to Dashboard
            </p>
          </Link>
        </Button>
      </div>
    </section>
  );
};

export default AdminFeedbackDetail;
