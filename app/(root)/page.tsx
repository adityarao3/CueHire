import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import InterviewCard from "@/components/InterviewCard";

import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  getInterviewsByUserId,
  getLatestInterviews,
} from "@/lib/actions/general.action";

async function Home() {
  const user = await getCurrentUser();

  const [userInterviews, allInterview] = await Promise.all([
    getInterviewsByUserId(user?.id!),
    getLatestInterviews({ userId: user?.id! }),
  ]);

  const hasPastInterviews = userInterviews?.length! > 0;
  const hasUpcomingInterviews = allInterview?.length! > 0;

  return (
    <>
      {/* Hero Section */}
      <section className="card-cta relative overflow-hidden">
        <div className="flex flex-col gap-6 max-w-xl z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-primary-200/20 text-primary-200 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              AI-Powered Screening
            </span>
          </div>
          <h1 className="text-4xl font-bold leading-tight max-sm:text-2xl">
            <span className="text-white">Welcome to </span>
            <span className="text-primary-200">CueHire</span>
          </h1>
          <h2 className="!text-xl !font-normal text-light-100 leading-relaxed">
            The smart way to screen Cuemath tutor candidates. Our AI conducts
            natural voice conversations to assess communication, patience,
            warmth, and teaching ability.
          </h2>

          <div className="flex flex-col gap-3 mt-2">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-success-100" />
              <p className="text-sm text-light-100">
                Natural voice conversations — not robotic Q&A
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-success-100" />
              <p className="text-sm text-light-100">
                Evaluates soft skills: clarity, patience, warmth & fluency
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-success-100" />
              <p className="text-sm text-light-100">
                Structured assessment reports for recruiters
              </p>
            </div>
          </div>

          <Button asChild className="btn-primary max-sm:w-full mt-2">
            <Link href="/interview">Begin Your Screening</Link>
          </Button>
        </div>

        <Image
          src="/robot.png"
          alt="AI Interviewer"
          width={400}
          height={400}
          className="max-sm:hidden"
        />
      </section>

      {/* Stats Bar */}
      <section className="flex flex-row gap-8 justify-center mt-6 max-sm:flex-col max-sm:items-center">
        <div className="flex flex-col items-center gap-1 px-8 py-4 rounded-xl bg-dark-200/50">
          <span className="text-2xl font-bold text-primary-200">
            {userInterviews?.length || 0}
          </span>
          <span className="text-xs text-light-400">Your Screenings</span>
        </div>
        <div className="flex flex-col items-center gap-1 px-8 py-4 rounded-xl bg-dark-200/50">
          <span className="text-2xl font-bold text-success-100">5</span>
          <span className="text-xs text-light-400">Assessment Dimensions</span>
        </div>
        <div className="flex flex-col items-center gap-1 px-8 py-4 rounded-xl bg-dark-200/50">
          <span className="text-2xl font-bold text-primary-100">AI</span>
          <span className="text-xs text-light-400">Powered by OpenAI</span>
        </div>
      </section>

      {/* Your Screenings */}
      <section className="flex flex-col gap-6 mt-8">
        <div className="flex items-center justify-between">
          <h2>Your Screening History</h2>
        </div>

        <div className="interviews-section">
          {hasPastInterviews ? (
            <InterviewCard
              key={userInterviews![0].id}
              userId={user?.id}
              interviewId={userInterviews![0].id}
              role={userInterviews![0].role}
              type={userInterviews![0].type}
              techstack={userInterviews![0].techstack}
              createdAt={userInterviews![0].createdAt}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 w-full">
              <p className="text-light-400 text-center">
                You haven&apos;t completed any screening interviews yet.
              </p>
              <Button asChild className="btn-primary mt-4">
                <Link href="/interview">Begin Your Screening Interview</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Available Screenings */}
      <section className="flex flex-col gap-6 mt-8">
        <h2>Available Screenings</h2>

        <div className="interviews-section">
          {hasUpcomingInterviews ? (
            allInterview?.map((interview) => (
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
            <p className="text-light-400">
              No screening interviews have been assigned yet. Please check back later.
            </p>
          )}
        </div>
      </section>
    </>
  );
}

export default Home;
