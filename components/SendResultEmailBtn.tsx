"use client";

import { useState } from "react";

interface SendResultEmailBtnProps {
  feedbackId: string;
  candidateEmail: string;
  candidateName: string;
  totalScore: number;
  recommendedAction?: string;
  finalAssessment: string;
  categoryScores?: Array<{ name: string; score: number; comment: string }>;
  strengths?: string[];
  areasForImprovement?: string[];
  interviewRole?: string;
  alreadySent?: boolean;
}

const SendResultEmailBtn = ({
  feedbackId,
  candidateEmail,
  candidateName,
  totalScore,
  recommendedAction,
  finalAssessment,
  categoryScores,
  strengths,
  areasForImprovement,
  interviewRole,
  alreadySent,
}: SendResultEmailBtnProps) => {
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(alreadySent || false);
  const [error, setError] = useState("");

  const handleSend = async () => {
    if (sent) return;

    const confirmed = window.confirm(
      `This will send the assessment result email to ${candidateEmail}. The email will formally inform them that they were not selected and include their full assessment breakdown.\n\nContinue?`
    );

    if (!confirmed) return;

    setIsSending(true);
    setError("");

    try {
      const res = await fetch("/api/send-result-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feedbackId,
          candidateEmail,
          candidateName,
          totalScore,
          recommendedAction,
          finalAssessment,
          categoryScores,
          strengths,
          areasForImprovement,
          interviewRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to send email");
        return;
      }

      setSent(true);
    } catch (err: any) {
      setError(err?.message || "Network error");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleSend}
        disabled={isSending || sent}
        className={`flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all cursor-pointer shadow-sm ${
          sent
            ? "bg-cue-green-light text-cue-green border border-cue-green/20 cursor-default"
            : "bg-cue-pink text-white hover:bg-cue-pink/90 disabled:opacity-50"
        }`}
      >
        {isSending ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Sending Email...
          </>
        ) : sent ? (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M20 6 9 17l-5-5" />
            </svg>
            Result Email Sent
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            Send Result via Email
          </>
        )}
      </button>

      {error && (
        <p className="text-sm text-cue-pink bg-cue-pink-light px-4 py-2 rounded-xl border border-cue-pink/20">
          {error}
        </p>
      )}
    </div>
  );
};

export default SendResultEmailBtn;
