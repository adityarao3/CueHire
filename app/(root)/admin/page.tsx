import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);
import { redirect } from "next/navigation";

import AssignScreeningForm from "@/components/AssignScreeningForm";
import AssessmentList from "@/components/AssessmentList";
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

  // Batch-fetch all unique users at once (avoids N+1 query problem)
  // Collect user IDs from both feedback and interviews
  const feedbackUserIds = allFeedback.map((fb) => fb.userId).filter(Boolean);
  const interviewUserIds = allInterviews.map((i) => i.userId).filter(Boolean);
  const uniqueUserIds = [...new Set([...feedbackUserIds, ...interviewUserIds])];

  const users = await Promise.all(uniqueUserIds.map((id) => getUserById(id)));
  const userMap = new Map(
    uniqueUserIds.map((id, idx) => [id, users[idx]])
  );

  // IDs of interviews that have feedback
  const completedInterviewIds = new Set(allFeedback.map((fb) => fb.interviewId));

  // Enrich feedback with interview and user data
  const enrichedFeedback = allFeedback.map((fb) => {
    const interview = allInterviews.find((i) => i.id === fb.interviewId);
    const candidate = fb.userId ? userMap.get(fb.userId) : null;
    return {
      id: fb.id,
      interviewId: fb.interviewId,
      totalScore: fb.totalScore,
      recommendedAction: fb.recommendedAction,
      finalAssessment: fb.finalAssessment,
      categoryScores: fb.categoryScores,
      createdAt: fb.createdAt,
      candidateName: candidate?.name || "Unknown",
      candidateEmail: candidate?.email || "N/A",
      interviewRole: interview?.role,
      interviewType: interview?.type,
    };
  });

  // Pending screenings: assigned but no feedback yet
  const pendingScreenings = allInterviews
    .filter((i) => !completedInterviewIds.has(i.id))
    .map((i) => {
      const candidate = i.userId ? userMap.get(i.userId) : null;
      return {
        id: i.id,
        candidateName: candidate?.name || (i as any).candidateName || "",
        candidateEmail: candidate?.email || (i as any).candidateEmail || "N/A",
        role: i.role,
        createdAt: i.createdAt,
      };
    });

  // Stats
  const hireCount = enrichedFeedback.filter(
    (f) => f.recommendedAction === "Strong Hire" || f.recommendedAction === "Hire"
  ).length;
  const maybeCount = enrichedFeedback.filter(
    (f) => f.recommendedAction === "Maybe"
  ).length;
  const noHireCount = enrichedFeedback.filter(
    (f) => f.recommendedAction === "No Hire"
  ).length;
  const avgScore =
    allFeedback.length > 0
      ? Math.round(
          allFeedback.reduce((sum, f) => sum + (f.totalScore || 0), 0) /
            allFeedback.length
        )
      : 0;

  return (
    <>
      {/* Admin Header */}
      <section className="card-cta">
        <div className="flex flex-col gap-4 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="bg-cue-pink-light text-cue-pink text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-cue-pink/20">
              Admin Panel
            </span>
          </div>
          <h1 className="text-3xl font-bold text-cue-dark">
            Candidate Assessment Dashboard
          </h1>
          <p className="text-cue-text-light">
            Assign screenings, track pending candidates, and review AI-generated
            assessment reports.
          </p>
        </div>

        <div className="flex flex-col items-center gap-2 max-sm:hidden">
          <div className="text-5xl font-bold text-cue-yellow-hover">
            {allFeedback.length}
          </div>
          <p className="text-sm text-cue-text-light">Total Assessments</p>
        </div>
      </section>

      {/* Assign Screening Form (Bulk) */}
      <section className="mt-6">
        <AssignScreeningForm />
      </section>

      {/* Stats Row */}
      <section className="flex flex-row gap-4 justify-center mt-6 flex-wrap max-sm:flex-col max-sm:items-center">
        <div className="flex flex-col items-center gap-1 px-6 py-4 rounded-2xl bg-white border border-cue-border shadow-sm min-w-[120px] flex-1 max-w-[180px]">
          <span className="text-2xl font-bold text-cue-green">
            {hireCount}
          </span>
          <span className="text-xs text-cue-text-light">Recommended</span>
        </div>
        <div className="flex flex-col items-center gap-1 px-6 py-4 rounded-2xl bg-white border border-cue-border shadow-sm min-w-[120px] flex-1 max-w-[180px]">
          <span className="text-2xl font-bold text-cue-yellow-hover">
            {maybeCount}
          </span>
          <span className="text-xs text-cue-text-light">Maybe</span>
        </div>
        <div className="flex flex-col items-center gap-1 px-6 py-4 rounded-2xl bg-white border border-cue-border shadow-sm min-w-[120px] flex-1 max-w-[180px]">
          <span className="text-2xl font-bold text-cue-pink">
            {noHireCount}
          </span>
          <span className="text-xs text-cue-text-light">Not Recommended</span>
        </div>
        <div className="flex flex-col items-center gap-1 px-6 py-4 rounded-2xl bg-white border border-cue-border shadow-sm min-w-[120px] flex-1 max-w-[180px]">
          <span className="text-2xl font-bold text-cue-blue">
            {avgScore}
          </span>
          <span className="text-xs text-cue-text-light">Avg Score</span>
        </div>
        <div className="flex flex-col items-center gap-1 px-6 py-4 rounded-2xl bg-white border border-cue-border shadow-sm min-w-[120px] flex-1 max-w-[180px]">
          <span className="text-2xl font-bold text-orange-500">
            {pendingScreenings.length}
          </span>
          <span className="text-xs text-cue-text-light">Pending</span>
        </div>
      </section>

      {/* Pending Screenings Tracker */}
      {pendingScreenings.length > 0 && (
        <section className="flex flex-col gap-4 mt-8">
          <div className="flex items-center justify-between">
            <h2>Pending Screenings</h2>
            <span className="text-xs text-cue-text-light bg-cue-yellow-light px-3 py-1 rounded-full border border-cue-yellow/20">
              {pendingScreenings.length} awaiting completion
            </span>
          </div>

          <div className="bg-white rounded-2xl overflow-hidden border border-cue-border shadow-sm">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-cue-border bg-gray-50 text-xs text-cue-text-light font-medium uppercase tracking-wider max-sm:hidden">
              <div className="col-span-4">Candidate</div>
              <div className="col-span-3">Role</div>
              <div className="col-span-3">Assigned On</div>
              <div className="col-span-2">Status</div>
            </div>

            {/* Rows */}
            {pendingScreenings.map((screening) => (
              <div
                key={screening.id}
                className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-cue-border last:border-0 items-center hover:bg-gray-50/50 transition-colors max-sm:grid-cols-1 max-sm:gap-2"
              >
                <div className="col-span-4 max-sm:col-span-1">
                  <p className="text-sm text-cue-dark font-medium">
                    {screening.candidateName || "—"}
                  </p>
                  <p className="text-xs text-cue-text-light">
                    {screening.candidateEmail}
                  </p>
                </div>
                <div className="col-span-3 max-sm:col-span-1">
                  <p className="text-sm text-cue-text">
                    {screening.role}
                  </p>
                </div>
                <div className="col-span-3 max-sm:col-span-1">
                  <p className="text-sm text-cue-text-light">
                    {dayjs
                      .utc(screening.createdAt)
                      .tz("Asia/Kolkata")
                      .format("MMM D, YYYY h:mm A")}{" "}
                    IST
                  </p>
                </div>
                <div className="col-span-2 max-sm:col-span-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-500 border border-orange-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                    Pending
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Assessments with Search/Filter */}
      <AssessmentList assessments={enrichedFeedback} />
    </>
  );
};

export default AdminDashboard;
