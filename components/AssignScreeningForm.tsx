"use client";

import { useState } from "react";
import { assignScreeningToCandidate } from "@/lib/actions/general.action";

interface AssignResult {
  email: string;
  success: boolean;
  message: string;
}

const AssignScreeningForm = () => {
  const [emailInput, setEmailInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<AssignResult[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    const emails = emailInput
      .split(/[,;\n\s]+/)
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e.length > 0 && e.includes("@"));

    if (emails.length === 0) return;

    setIsSubmitting(true);
    setResults([]);

    const batchResults: AssignResult[] = [];

    for (const email of emails) {
      try {
        const res = await assignScreeningToCandidate(email);
        batchResults.push({
          email,
          success: !!res.success,
          message: res.success
            ? `Assigned to ${res.candidateName}${
                res.alreadyRegistered ? "" : " (not yet registered)"
              }`
            : res.error || "Failed",
        });
      } catch (err: any) {
        batchResults.push({
          email,
          success: false,
          message: err?.message || "Error",
        });
      }
    }

    setResults(batchResults);
    if (batchResults.every((r) => r.success)) {
      setEmailInput("");
    }
    setIsSubmitting(false);
  };

  const successCount = results.filter((r) => r.success).length;
  const failCount = results.filter((r) => !r.success).length;

  return (
    <div className="bg-white rounded-2xl p-6 border border-cue-border shadow-sm">
      <div className="flex flex-col gap-1 mb-5">
        <h3 className="text-lg font-semibold text-cue-dark">
          Assign Screening to Candidates
        </h3>
        <p className="text-sm text-cue-text-light">
          Enter one or more candidate emails (separated by commas, newlines, or
          spaces). They&apos;ll see the screening when they log in.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-row gap-3 max-sm:flex-col">
          <textarea
            value={emailInput}
            onChange={(e) => {
              setEmailInput(e.target.value);
              setResults([]);
            }}
            placeholder={"candidate1@example.com, candidate2@example.com"}
            required
            rows={2}
            className="flex-1 bg-cue-bg border border-cue-border rounded-2xl px-5 py-3 text-sm text-cue-dark placeholder:text-cue-text-light/60 focus:outline-none focus:border-cue-yellow focus:ring-1 focus:ring-cue-yellow/25 transition-all resize-none"
          />
          <button
            type="submit"
            disabled={isSubmitting || !emailInput.trim()}
            className="px-6 py-3 rounded-2xl bg-cue-yellow text-cue-dark text-sm font-bold hover:bg-cue-yellow-hover transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex items-center gap-2 justify-center min-w-[160px] h-fit self-end shadow-sm"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-cue-dark/30 border-t-cue-dark rounded-full animate-spin" />
                Assigning...
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <line x1="19" y1="8" x2="19" y2="14" />
                  <line x1="22" y1="11" x2="16" y2="11" />
                </svg>
                Assign Screening
              </>
            )}
          </button>
        </div>

        {results.length > 0 && (
          <div className="flex flex-col gap-2">
            {results.length > 1 && (
              <p className="text-xs text-cue-text-light">
                {successCount} assigned successfully
                {failCount > 0 && `, ${failCount} failed`}
              </p>
            )}
            {results.map((r, i) => (
              <div
                key={i}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm ${
                  r.success
                    ? "bg-cue-green-light text-cue-green border border-cue-green/20"
                    : "bg-cue-pink-light text-cue-pink border border-cue-pink/20"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  {r.success ? (
                    <path d="M20 6 9 17l-5-5" />
                  ) : (
                    <>
                      <circle cx="12" cy="12" r="10" />
                      <line x1="15" y1="9" x2="9" y2="15" />
                      <line x1="9" y1="9" x2="15" y2="15" />
                    </>
                  )}
                </svg>
                <span className="font-medium">{r.email}</span>
                <span className="opacity-70">— {r.message}</span>
              </div>
            ))}
          </div>
        )}
      </form>
    </div>
  );
};

export default AssignScreeningForm;
