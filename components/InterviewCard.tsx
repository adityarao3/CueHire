import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import Image from "next/image";

import { cn } from "@/lib/utils";
import { getFeedbackByInterviewId } from "@/lib/actions/general.action";
import LoadingLink from "@/components/LoadingLink";

dayjs.extend(utc);
dayjs.extend(timezone);

const InterviewCard = async ({
  interviewId,
  userId,
  role,
  type,
  techstack,
  createdAt,
}: InterviewCardProps) => {
  const feedback =
    userId && interviewId
      ? await getFeedbackByInterviewId({
          interviewId,
          userId,
        })
      : null;

  const normalizedType = /mix/gi.test(type) ? "Mixed" : type;

  const badgeColor =
    {
      Behavioral: "bg-cue-blue-light text-cue-blue border-cue-blue/20",
      Mixed: "bg-gray-100 text-cue-text border-gray-200",
      Technical: "bg-cue-pink-light text-cue-pink border-cue-pink/20",
      Screening: "bg-cue-yellow-light text-cue-yellow-hover border-cue-yellow/20",
    }[normalizedType] || "bg-gray-100 text-cue-text border-gray-200";

  const formattedDate = dayjs
    .utc(feedback?.createdAt || createdAt || Date.now())
    .tz("Asia/Kolkata")
    .format("MMM D, YYYY");

  return (
    <div className="w-[360px] max-sm:w-full min-h-96">
      <div className="bg-white rounded-2xl min-h-full flex flex-col p-6 relative overflow-hidden gap-10 justify-between border border-cue-border shadow-sm hover:shadow-md transition-shadow">
        <div>
          {/* Type Badge */}
          <div
            className={cn(
              "absolute top-0 right-0 w-fit px-4 py-2 rounded-bl-lg border-b border-l",
              badgeColor
            )}
          >
            <p className="text-sm font-semibold capitalize">{normalizedType}</p>
          </div>

          {/* Cover Image */}
          <div className="w-[90px] h-[90px] rounded-full bg-gradient-to-br from-cue-yellow-light to-cue-yellow/20 flex items-center justify-center border border-cue-yellow/20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-cue-yellow-hover"
            >
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </div>

          {/* Interview Role */}
          <h3 className="mt-5 capitalize text-cue-dark">{role} Screening</h3>

          {/* Date & Status */}
          <div className="flex flex-row gap-5 mt-3">
            <div className="flex flex-row gap-2">
              <Image
                src="/calendar.svg"
                width={22}
                height={22}
                alt="calendar"
              />
              <p className="text-cue-text-light">{formattedDate}</p>
            </div>

            <div className="flex flex-row gap-2 items-center">
              <Image src="/star.svg" width={22} height={22} alt="star" />
              <p className={feedback ? "text-cue-green font-medium" : "text-cue-yellow-hover font-medium"}>
                {feedback ? "Completed" : "Pending"}
              </p>
            </div>
          </div>

          {/* Status Text */}
          <p className="line-clamp-2 mt-5 text-cue-text-light">
            {feedback
              ? "Your screening has been completed. The Cuemath team will review your results."
              : "Your screening interview is ready. Click below to begin."}
          </p>
        </div>

        <div className="flex flex-row justify-between items-center">
          <LoadingLink
            href={
              feedback
                ? `/interview/${interviewId}/feedback`
                : `/interview/${interviewId}`
            }
            className="px-5 py-2.5 rounded-full bg-cue-yellow text-cue-dark text-sm font-bold hover:bg-cue-yellow-hover transition-all shadow-sm cursor-pointer"
          >
            {feedback ? "View Status" : "Begin Screening"}
          </LoadingLink>
        </div>
      </div>
    </div>
  );
};

export default InterviewCard;
