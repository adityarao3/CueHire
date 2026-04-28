import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/actions/auth.action";
import { getAssignedInterviews } from "@/lib/actions/general.action";
import InterviewCard from "@/components/InterviewCard";

export const dynamic = "force-dynamic";

const InterviewPage = async () => {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  // Get screenings assigned to this user (by userId or email)
  const assignedInterviews = await getAssignedInterviews(user.id, user.email);

  return (
    <>
      {/* Page Header */}
      <section className="card-cta">
        <div className="flex flex-col gap-4 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="bg-primary-200/20 text-primary-200 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Interview Room
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white max-sm:text-2xl">
            Your Assigned Screenings
          </h1>
          <p className="text-light-100">
            Select a screening below to begin your AI voice interview. These
            have been assigned to you by the recruitment team.
          </p>
        </div>

        <div className="flex flex-col items-center gap-2 max-sm:hidden">
          <Image
            src="/ai-avatar.png"
            alt="AI Interviewer"
            width={65}
            height={54}
            className="object-cover"
          />
          <p className="text-xs text-light-400">AI Interviewer</p>
        </div>
      </section>

      {/* Assigned Screenings */}
      {assignedInterviews.length > 0 ? (
        <section className="flex flex-col gap-6">
          <h2>Available Screenings</h2>
          <div className="interviews-section">
            {assignedInterviews.map((interview) => (
              <InterviewCard
                key={interview.id}
                userId={user.id}
                interviewId={interview.id}
                role={interview.role}
                type={interview.type}
                techstack={interview.techstack}
                createdAt={interview.createdAt}
              />
            ))}
          </div>
        </section>
      ) : (
        <section className="flex flex-col items-center justify-center py-16 gap-5">
          <div className="w-20 h-20 rounded-full bg-dark-200/60 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-light-400"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            <h3 className="text-xl font-semibold text-white">
              No Screenings Assigned Yet
            </h3>
            <p className="text-light-400 text-sm max-w-md">
              The recruitment team hasn&apos;t assigned any screening interviews to
              you yet. Please check back later or contact the team if you
              believe this is an error.
            </p>
          </div>
        </section>
      )}
    </>
  );
};

export default InterviewPage;
