import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

import { getInterviewById } from "@/lib/actions/general.action";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/actions/auth.action";

const Feedback = async ({ params }: RouteParams) => {
  const { id } = await params;
  const user = await getCurrentUser();

  const interview = await getInterviewById(id);
  if (!interview) redirect("/");

  // Candidates see a thank-you page — feedback is admin-only
  const isAdmin = user?.email === "admin@cuehire.com";

  if (isAdmin) {
    // Admin is redirected to admin dashboard to see feedback
    redirect("/admin");
  }

  return (
    <section className="section-feedback">
      <div className="flex flex-col items-center gap-6 text-center py-8">
        {/* Success Icon */}
        <div className="w-20 h-20 rounded-full bg-success-100/20 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-success-100"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>

        <h1 className="text-4xl font-semibold">
          Screening Complete!
        </h1>

        <div className="max-w-2xl">
          <p className="text-lg text-light-100 leading-relaxed">
            Your screening interview for the{" "}
            <span className="capitalize text-primary-200 font-semibold">
              {interview.role}
            </span>{" "}
            position has been completed successfully.
          </p>
        </div>

        <div className="bg-dark-200 rounded-2xl p-8 max-w-lg w-full mt-4">
          <h3 className="text-xl font-semibold mb-4 text-primary-100">
            What Happens Next?
          </h3>
          <div className="flex flex-col gap-4 text-left">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary-200/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-primary-200 text-xs font-bold">1</span>
              </div>
              <p className="text-sm text-light-100">
                Our AI is analyzing your conversation and generating a detailed
                assessment report.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary-200/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-primary-200 text-xs font-bold">2</span>
              </div>
              <p className="text-sm text-light-100">
                The Cuemath recruitment team will review your assessment within
                24-48 hours.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary-200/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-primary-200 text-xs font-bold">3</span>
              </div>
              <p className="text-sm text-light-100">
                You&apos;ll receive an email with the next steps if you&apos;re
                selected to move forward.
              </p>
            </div>
          </div>
        </div>

        <Button className="btn-primary mt-4">
          <Link href="/" className="flex w-full justify-center">
            <p className="text-sm font-semibold text-black text-center">
              Back to Dashboard
            </p>
          </Link>
        </Button>
      </div>
    </section>
  );
};

export default Feedback;
