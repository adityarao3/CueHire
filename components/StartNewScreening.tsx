"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const StartNewScreening = ({ userId }: { userId: string }) => {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const handleStartNew = async () => {
    setIsCreating(true);
    try {
      const { createScreeningInterview } = await import(
        "@/lib/actions/general.action"
      );
      const { interviewId } = await createScreeningInterview(userId);
      router.push(`/interview/${interviewId}`);
    } catch (error) {
      console.error("Error creating screening:", error);
      setIsCreating(false);
    }
  };

  return (
    <button
      onClick={handleStartNew}
      disabled={isCreating}
      className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-primary-200 to-primary-100 text-dark-100 font-bold text-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary-200/25 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none cursor-pointer"
    >
      {isCreating ? (
        <>
          <div className="w-5 h-5 border-2 border-dark-100/30 border-t-dark-100 rounded-full animate-spin" />
          Creating your screening...
        </>
      ) : (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="22" />
          </svg>
          Start New Screening
        </>
      )}
    </button>
  );
};

export default StartNewScreening;
