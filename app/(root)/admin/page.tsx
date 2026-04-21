import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  getAllFeedback,
  getAllInterviews,
  getUserById,
} from "@/lib/actions/general.action";

export const dynamic = "force-dynamic";

const AdminDashboard = async () => {
  const user = await getCurrentUser();

  // Only admin can access this page
  if (!user || user.email !== "admin@cuehire.com") {
    redirect("/");
  }

  const [allFeedback, allInterviews] = await Promise.all([
    getAllFeedback(),
    getAllInterviews(),
  ]);

  // Enrich feedback with interview and user data
  const enrichedFeedback = await Promise.all(
    allFeedback.map(async (fb) => {
      const interview = allInterviews.find((i) => i.id === fb.interviewId);
      const candidate = fb.userId ? await getUserById(fb.userId) : null;
      return {
        ...fb,
        interview,
        candidateName: candidate?.name || "Unknown",
        candidateEmail: candidate?.email || "N/A",
      };
    })
  );

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

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success-100";
    if (score >= 60) return "text-yellow-400";
    if (score >= 40) return "text-orange-400";
    return "text-destructive-100";
  };

  return (
    <>
      {/* Admin Header */}
      <section className="card-cta">
        <div className="flex flex-col gap-4 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="bg-destructive-100/20 text-destructive-100 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Admin Panel
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white">
            Candidate Assessment Dashboard
          </h1>
          <p className="text-light-100">
            Review screening results, assessment scores, and AI-generated
            reports for all tutor candidates.
          </p>
        </div>

        <div className="flex flex-col items-center gap-2 max-sm:hidden">
          <div className="text-5xl font-bold text-primary-200">
            {allFeedback.length}
          </div>
          <p className="text-sm text-light-400">Total Assessments</p>
        </div>
      </section>

      {/* Stats Row */}
      <section className="flex flex-row gap-6 justify-center mt-6 max-sm:flex-col max-sm:items-center">
        <div className="flex flex-col items-center gap-1 px-8 py-4 rounded-xl bg-dark-200/50 min-w-[140px]">
          <span className="text-2xl font-bold text-success-100">
            {enrichedFeedback.filter((f) => f.recommendedAction === "Strong Hire" || f.recommendedAction === "Hire").length}
          </span>
          <span className="text-xs text-light-400">Recommended</span>
        </div>
        <div className="flex flex-col items-center gap-1 px-8 py-4 rounded-xl bg-dark-200/50 min-w-[140px]">
          <span className="text-2xl font-bold text-yellow-400">
            {enrichedFeedback.filter((f) => f.recommendedAction === "Maybe").length}
          </span>
          <span className="text-xs text-light-400">Maybe</span>
        </div>
        <div className="flex flex-col items-center gap-1 px-8 py-4 rounded-xl bg-dark-200/50 min-w-[140px]">
          <span className="text-2xl font-bold text-destructive-100">
            {enrichedFeedback.filter((f) => f.recommendedAction === "No Hire").length}
          </span>
          <span className="text-xs text-light-400">Not Recommended</span>
        </div>
        <div className="flex flex-col items-center gap-1 px-8 py-4 rounded-xl bg-dark-200/50 min-w-[140px]">
          <span className="text-2xl font-bold text-primary-200">
            {allFeedback.length > 0
              ? Math.round(
                  allFeedback.reduce((sum, f) => sum + (f.totalScore || 0), 0) /
                    allFeedback.length
                )
              : 0}
          </span>
          <span className="text-xs text-light-400">Avg Score</span>
        </div>
      </section>

      {/* Candidate Results */}
      <section className="flex flex-col gap-6 mt-8">
        <h2>All Candidate Assessments</h2>

        {enrichedFeedback.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-light-400">
              No candidate assessments available yet.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {enrichedFeedback.map((fb) => (
              <div key={fb.id} className="card-border w-full">
                <div className="dark-gradient rounded-2xl p-6">
                  {/* Header Row */}
                  <div className="flex flex-row justify-between items-start gap-4 flex-wrap">
                    <div className="flex flex-col gap-1">
                      <h3 className="text-xl">
                        {fb.candidateName}
                      </h3>
                      <p className="text-sm text-light-400">
                        {fb.candidateEmail}
                      </p>
                      <p className="text-xs text-light-400 mt-1">
                        {fb.interview?.role
                          ? `${fb.interview.role} — ${fb.interview.type}`
                          : "Screening Interview"}
                        {" · "}
                        {dayjs.utc(fb.createdAt).tz("Asia/Kolkata").format("MMM D, YYYY h:mm A")} IST
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Recommended Action Badge */}
                      <span
                        className={`px-4 py-1.5 rounded-full text-sm font-bold ${getActionColor(
                          fb.recommendedAction
                        )}`}
                      >
                        {fb.recommendedAction || "Pending"}
                      </span>

                      {/* Total Score */}
                      <div className="flex flex-col items-center">
                        <span
                          className={`text-3xl font-bold ${getScoreColor(
                            fb.totalScore
                          )}`}
                        >
                          {fb.totalScore}
                        </span>
                        <span className="text-xs text-light-400">/100</span>
                      </div>
                    </div>
                  </div>

                  {/* Score Bars */}
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 mt-5">
                    {fb.categoryScores?.map((cat, idx) => (
                      <div key={idx} className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-light-400 truncate">
                            {cat.name}
                          </span>
                          <span
                            className={`text-xs font-bold ${getScoreColor(
                              cat.score
                            )}`}
                          >
                            {cat.score}
                          </span>
                        </div>
                        <div className="w-full bg-dark-100 rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full bg-primary-200 transition-all"
                            style={{ width: `${cat.score}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Final Assessment */}
                  <p className="text-sm text-light-100 mt-4 line-clamp-3">
                    {fb.finalAssessment}
                  </p>

                  {/* View Details Button */}
                  <div className="flex justify-end mt-4">
                    <Button className="btn-primary" asChild>
                      <Link href={`/admin/feedback/${fb.id}`}>
                        View Full Report
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
};

export default AdminDashboard;
