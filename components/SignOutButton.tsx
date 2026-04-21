"use client";

import { useRouter } from "next/navigation";
import { signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "@/firebase/client";
import { signOut } from "@/lib/actions/auth.action";

const SignOutButton = () => {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await firebaseSignOut(auth);
      await signOut();
      router.push("/sign-in");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <button
      onClick={handleSignOut}
      className="text-sm font-semibold text-light-400 bg-dark-200 px-4 py-2 rounded-full hover:bg-dark-200/80 hover:text-white transition-colors cursor-pointer"
    >
      Sign Out
    </button>
  );
};

export default SignOutButton;
