import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/actions/auth.action";
import { createScreeningInterview } from "@/lib/actions/general.action";

const Page = async () => {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  // Create a minimal interview record to get an ID for saving feedback
  const { interviewId } = await createScreeningInterview(user.id);

  redirect(`/interview/${interviewId}`);
};

export default Page;
