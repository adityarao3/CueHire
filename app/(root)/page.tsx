import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import InterviewCard from "@/components/InterviewCard";

import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  getAssignedInterviews,
  getFeedbackByInterviewId,
} from "@/lib/actions/general.action";

export const dynamic = "force-dynamic";

async function Home() {
  const user = await getCurrentUser();

  // Admin goes straight to admin dashboard
  if (user?.email === "admin@cuehire.com") {
    redirect("/admin");
  }

  // Get screenings assigned to this user
  const assignedInterviews = await getAssignedInterviews(
    user?.id!,
    user?.email!
  );

  // Count completed screenings (those that have feedback)
  const feedbackResults = await Promise.all(
    assignedInterviews.map((i) =>
      getFeedbackByInterviewId({ interviewId: i.id, userId: user?.id! })
    )
  );
  const completedCount = feedbackResults.filter(Boolean).length;

  const hasPendingScreenings = assignedInterviews.length > 0;

  return (
    <>
      {/* Hero Section */}
      <section className="card-cta relative overflow-hidden">
        <div className="flex flex-col gap-6 max-w-xl z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-cue-yellow-light text-cue-yellow-hover text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-cue-yellow/30">
              AI-Powered Screening
            </span>
          </div>
          <h1 className="text-4xl font-bold leading-tight max-sm:text-2xl">
            <span className="text-cue-dark">Welcome to </span>
            <span className="text-cue-yellow-hover">CueHire</span>
          </h1>
          <h2 className="!text-xl !font-normal text-cue-text-light leading-relaxed">
            The smart way to screen Cuemath tutor candidates. Our AI conducts
            natural voice conversations to assess communication, patience,
            warmth, and teaching ability.
          </h2>

          <div className="flex flex-col gap-3 mt-2">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-cue-green" />
              <p className="text-sm text-cue-text-light">
                Natural voice conversations — not robotic Q&A
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-cue-green" />
              <p className="text-sm text-cue-text-light">
                Evaluates soft skills: clarity, patience, warmth & fluency
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-cue-green" />
              <p className="text-sm text-cue-text-light">
                Structured assessment reports for recruiters
              </p>
            </div>
          </div>

          {hasPendingScreenings && (
            <Button asChild className="btn-primary max-sm:w-full mt-2">
              <Link href="/interview">View Your Screenings</Link>
            </Button>
          )}
        </div>

        <Image
          src="/cuehire-logo.png"
          alt="CueHire AI Screening Platform"
          width={450}
          height={450}
          className="max-sm:hidden object-contain"
        />
      </section>

      {/* Stats Bar */}
      <section className="flex flex-row gap-8 justify-center mt-6 max-sm:flex-col max-sm:items-center">
        <div className="flex flex-col items-center gap-1 px-8 py-5 rounded-2xl bg-white border border-cue-border shadow-sm min-w-[140px]">
          <span className="text-2xl font-bold text-cue-yellow-hover">
            {assignedInterviews.length}
          </span>
          <span className="text-xs text-cue-text-light">Assigned Screenings</span>
        </div>
        <div className="flex flex-col items-center gap-1 px-8 py-5 rounded-2xl bg-white border border-cue-border shadow-sm min-w-[140px]">
          <span className="text-2xl font-bold text-cue-green">
            {completedCount}
          </span>
          <span className="text-xs text-cue-text-light">Completed</span>
        </div>
      </section>

      {/* Assigned Screenings */}
      <section className="flex flex-col gap-6 mt-8">
        <h2>Your Assigned Screenings</h2>

        <div className="interviews-section">
          {hasPendingScreenings ? (
            assignedInterviews.map((interview) => (
              <InterviewCard
                key={interview.id}
                userId={user?.id}
                interviewId={interview.id}
                role={interview.role}
                type={interview.type}
                techstack={interview.techstack}
                createdAt={interview.createdAt}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 w-full">
              <div className="w-16 h-16 rounded-full bg-dark-200/60 flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-light-400"
                >
                  <rect
                    x="3"
                    y="4"
                    width="18"
                    height="18"
                    rx="2"
                    ry="2"
                  />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <p className="text-light-400 text-center max-w-md">
                No screening interviews have been assigned to you yet. The
                recruitment team will assign one when you&apos;re ready.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default Home;
