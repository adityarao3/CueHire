import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);
import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import SendResultEmailBtn from "@/components/SendResultEmailBtn";
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
    if (score >= 80) return "text-cue-green";
    if (score >= 60) return "text-cue-yellow-hover";
    if (score >= 40) return "text-orange-500";
    return "text-cue-pink";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-cue-green";
    if (score >= 60) return "bg-cue-yellow";
    if (score >= 40) return "bg-orange-400";
    return "bg-cue-pink";
  };

  const getActionColor = (action?: string) => {
    switch (action) {
      case "Strong Hire":
        return "bg-cue-green text-white";
      case "Hire":
        return "bg-cue-green/70 text-white";
      case "Maybe":
        return "bg-cue-yellow text-cue-dark";
      case "No Hire":
        return "bg-cue-pink text-white";
      default:
        return "bg-gray-100 text-cue-text";
    }
  };

  return (
    <section className="section-feedback">
      {/* Back Button */}
      <div>
        <Button className="btn-secondary" asChild>
          <Link href="/admin">
            <p className="text-sm font-semibold text-cue-dark text-center">
              ← Back to Dashboard
            </p>
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="bg-cue-pink-light text-cue-pink text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-cue-pink/20">
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
          <span className="text-cue-yellow-hover">
            {candidate?.name || "Unknown Candidate"}
          </span>
        </h1>

        <div className="flex flex-wrap gap-5 text-sm text-cue-text-light">
          <span>{candidate?.email || "N/A"}</span>
          <span>
            {interview?.role
              ? `${interview.role} — ${interview.type}`
              : "Screening"}
          </span>
          <span>
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
        <span className="text-cue-text-light">Overall Score /100</span>
      </div>

      <hr className="border-cue-border" />

      {/* Final Assessment */}
      <div>
        <h2 className="mb-3">Final Assessment</h2>
        <p className="text-cue-text-light leading-relaxed">{feedback.finalAssessment}</p>
      </div>

      {/* Category Breakdown */}
      <div className="flex flex-col gap-5">
        <h2>Assessment Breakdown</h2>
        {feedback.categoryScores?.map((category, index) => (
          <div key={index} className="bg-white rounded-xl p-5 border border-cue-border shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="font-bold text-lg text-cue-dark">
                {index + 1}. {category.name}
              </p>
              <span
                className={`text-2xl font-bold ${getScoreColor(category.score)}`}
              >
                {category.score}/100
              </span>
            </div>
            {/* Score Bar */}
            <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
              <div
                className={`h-2 rounded-full ${getScoreBg(category.score)} transition-all`}
                style={{ width: `${category.score}%` }}
              />
            </div>
            <p className="text-cue-text-light text-sm leading-relaxed">{category.comment}</p>
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
              className="bg-cue-yellow-light/50 rounded-xl p-5 border-l-4 border-cue-yellow"
            >
              <p className="text-xs text-cue-yellow-hover font-bold uppercase tracking-wider mb-2">
                {eq.dimension}
              </p>
              <blockquote className="text-cue-text italic border-none pl-0 mb-2">
                &ldquo;{eq.quote}&rdquo;
              </blockquote>
              <p className="text-sm text-cue-text-light">{eq.analysis}</p>
            </div>
          ))}
        </div>
      )}

      {/* Strengths */}
      <div className="flex flex-col gap-3">
        <h3 className="text-cue-green">Strengths</h3>
        <ul>
          {feedback.strengths?.map((strength, index) => (
            <li key={index} className="text-cue-text">{strength}</li>
          ))}
        </ul>
      </div>

      {/* Areas for Improvement */}
      <div className="flex flex-col gap-3">
        <h3 className="text-cue-yellow-hover">Areas for Improvement</h3>
        <ul>
          {feedback.areasForImprovement?.map((area, index) => (
            <li key={index} className="text-cue-text">{area}</li>
          ))}
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="buttons">
        <Button className="btn-primary flex-1" asChild>
          <Link href="/admin" className="flex w-full justify-center">
            <p className="text-sm font-semibold text-cue-dark text-center">
              Back to Dashboard
            </p>
          </Link>
        </Button>

        <SendResultEmailBtn
          feedbackId={feedback.id}
          candidateEmail={candidate?.email || ""}
          candidateName={candidate?.name || "Unknown"}
          totalScore={feedback.totalScore}
          recommendedAction={feedback.recommendedAction}
          finalAssessment={feedback.finalAssessment}
          categoryScores={feedback.categoryScores}
          strengths={feedback.strengths}
          areasForImprovement={feedback.areasForImprovement}
          interviewRole={interview?.role}
          alreadySent={(feedback as any).rejectionEmailSent || false}
        />
      </div>
    </section>
  );
};

export default AdminFeedbackDetail;
