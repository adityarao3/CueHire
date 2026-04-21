import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import Link from "next/link";
import Image from "next/image";

import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { getFeedbackByInterviewId } from "@/lib/actions/general.action";

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
      Behavioral: "bg-light-400",
      Mixed: "bg-light-600",
      Technical: "bg-light-800",
      Screening: "bg-primary-200/40",
    }[normalizedType] || "bg-light-600";

  const formattedDate = dayjs
    .utc(feedback?.createdAt || createdAt || Date.now())
    .tz("Asia/Kolkata")
    .format("MMM D, YYYY");

  return (
    <div className="card-border w-[360px] max-sm:w-full min-h-96">
      <div className="card-interview">
        <div>
          {/* Type Badge */}
          <div
            className={cn(
              "absolute top-0 right-0 w-fit px-4 py-2 rounded-bl-lg",
              badgeColor
            )}
          >
            <p className="badge-text ">{normalizedType}</p>
          </div>

          {/* Cover Image */}
          <div className="w-[90px] h-[90px] rounded-full bg-gradient-to-br from-primary-200/30 to-primary-200/10 flex items-center justify-center border border-primary-200/20">
            <span className="text-4xl">🎓</span>
          </div>

          {/* Interview Role */}
          <h3 className="mt-5 capitalize">{role} Screening</h3>

          {/* Date */}
          <div className="flex flex-row gap-5 mt-3">
            <div className="flex flex-row gap-2">
              <Image
                src="/calendar.svg"
                width={22}
                height={22}
                alt="calendar"
              />
              <p>{formattedDate}</p>
            </div>

            <div className="flex flex-row gap-2 items-center">
              <Image src="/star.svg" width={22} height={22} alt="star" />
              <p>
                {feedback ? "Completed" : "Pending"}
              </p>
            </div>
          </div>

          {/* Status Text */}
          <p className="line-clamp-2 mt-5">
            {feedback
              ? "Your screening has been completed. The Cuemath team will review your results."
              : "Your screening interview is ready. Click below to begin."}
          </p>
        </div>

        <div className="flex flex-row justify-between items-center">

          <Button className="btn-primary">
            <Link
              href={
                feedback
                  ? `/interview/${interviewId}/feedback`
                  : `/interview/${interviewId}`
              }
            >
              {feedback ? "View Status" : "Begin Screening"}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InterviewCard;
