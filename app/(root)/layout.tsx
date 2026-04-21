import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";
import { redirect } from "next/navigation";

import { isAuthenticated, getCurrentUser } from "@/lib/actions/auth.action";
import SignOutButton from "@/components/SignOutButton";

const Layout = async ({ children }: { children: ReactNode }) => {
  const isUserAuthenticated = await isAuthenticated();
  if (!isUserAuthenticated) redirect("/sign-in");

  const user = await getCurrentUser();
  const isAdmin = user?.email === "admin@cuehire.com";

  return (
    <div className="root-layout">
      <nav className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="CueHire Logo" width={38} height={32} />
          <h2 className="text-primary-100">CueHire</h2>
        </Link>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <Link
              href="/admin"
              className="text-sm font-semibold text-primary-200 bg-dark-200 px-4 py-2 rounded-full hover:bg-dark-200/80 transition-colors"
            >
              Admin Dashboard
            </Link>
          )}

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary-200 flex items-center justify-center text-sm font-bold text-dark-100">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <span className="text-sm text-light-100 font-medium max-sm:hidden">
              {user?.name || "User"}
            </span>
          </div>

          <SignOutButton />
        </div>
      </nav>

      {children}
    </div>
  );
};

export default Layout;
