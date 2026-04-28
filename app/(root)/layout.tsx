import { ReactNode } from "react";
import { redirect } from "next/navigation";

import { isAuthenticated, getCurrentUser } from "@/lib/actions/auth.action";
import Navbar from "@/components/Navbar";

const Layout = async ({ children }: { children: ReactNode }) => {
  const isUserAuthenticated = await isAuthenticated();
  if (!isUserAuthenticated) redirect("/sign-in");

  const user = await getCurrentUser();
  const isAdmin = user?.email === "admin@cuehire.com";

  return (
    <div className="root-layout">
      <Navbar
        userName={user?.name || "User"}
        userInitial={user?.name?.charAt(0).toUpperCase() || "U"}
        isAdmin={isAdmin}
      />

      {children}
    </div>
  );
};

export default Layout;
