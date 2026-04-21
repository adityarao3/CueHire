"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createFeedback } from "@/lib/actions/general.action";

const ProcessingPage = () => {
  const router = useRouter();
  const params = useParams();
  const interviewId = params.id as string;
  const [status, setStatus] = useState<"loading" | "processing" | "done" | "error">("loading");
  const [error, setError] = useState("");
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    const process = async () => {
      try {
        // Read data from sessionStorage
        const raw = sessionStorage.getItem(`interview-data-${interviewId}`);

        if (!raw) {
          console.error("No interview data found");
          setStatus("error");
          setTimeout(() => router.push("/"), 2000);
          return;
        }

        const data = JSON.parse(raw);
        const { transcript, userId, feedbackId } = data;

        console.log("Processing interview, transcript messages:", transcript.length);
        setStatus("processing");

        // Call the server action to generate feedback via Gemini
        const result = await createFeedback({
          interviewId,
          userId,
          transcript,
          feedbackId: feedbackId || undefined,
        });

        console.log("Feedback result:", result);

        // Clean up sessionStorage
        sessionStorage.removeItem(`interview-data-${interviewId}`);

        if (result.success && result.feedbackId) {
          setStatus("done");
          // Redirect to the thank-you/feedback page
          router.push(`/interview/${interviewId}/feedback`);
        } else {
          console.error("Feedback generation failed:", result);
          setError(result.error || "Failed to generate assessment");
          setStatus("error");
          setTimeout(() => router.push("/"), 5000);
        }
      } catch (err: any) {
        console.error("Processing error:", err);
        setError(err?.message || "Something went wrong");
        setStatus("error");
        setTimeout(() => router.push("/"), 5000);
      }
    };

    process();
  }, [interviewId, router]);

  return (
    <section className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
      {status === "error" ? (
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-20 h-20 rounded-full bg-destructive-100/20 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-destructive-100">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-white">
            Something went wrong
          </h2>
          <p className="text-light-400 text-sm">{error || "Unknown error"}</p>
          <p className="text-light-400 text-xs mt-2">Redirecting you back...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-6 text-center">
          {/* Spinner */}
          <div className="relative">
            <div className="w-20 h-20 border-4 border-dark-200 rounded-full" />
            <div className="w-20 h-20 border-4 border-primary-200 border-t-transparent rounded-full animate-spin absolute top-0 left-0" />
          </div>

          <div className="flex flex-col items-center gap-3">
            <h2 className="text-2xl font-semibold text-white">
              Wrapping up your interview...
            </h2>
            <p className="text-light-400 text-sm max-w-md leading-relaxed">
              We&apos;re saving your conversation and generating your assessment.
              This takes about 15-30 seconds.
            </p>
          </div>

          {/* Progress steps */}
          <div className="flex flex-col gap-3 mt-4 w-full max-w-xs">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-success-100 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-dark-100"><path d="M20 6 9 17l-5-5" /></svg>
              </div>
              <span className="text-sm text-light-100">Interview completed</span>
            </div>

            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                status === "processing" || status === "done"
                  ? "bg-success-100"
                  : "bg-primary-200/30 border-2 border-primary-200"
              }`}>
                {status === "loading" ? (
                  <div className="w-2 h-2 rounded-full bg-primary-200 animate-pulse" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-dark-100"><path d="M20 6 9 17l-5-5" /></svg>
                )}
              </div>
              <span className={`text-sm ${status === "loading" ? "text-primary-200 font-medium" : "text-light-100"}`}>
                Saving transcript
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                status === "processing"
                  ? "bg-primary-200/30 border-2 border-primary-200"
                  : status === "done"
                  ? "bg-success-100"
                  : "bg-dark-200"
              }`}>
                {status === "processing" && (
                  <div className="w-2 h-2 rounded-full bg-primary-200 animate-pulse" />
                )}
              </div>
              <span className={`text-sm ${
                status === "processing" ? "text-primary-200 font-medium" : "text-light-400"
              }`}>
                Generating assessment report
              </span>
            </div>
          </div>

          <p className="text-xs text-light-400 mt-2">
            Please don&apos;t close this page
          </p>
        </div>
      )}
    </section>
  );
};

export default ProcessingPage;
