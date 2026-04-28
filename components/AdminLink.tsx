"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const AdminLink = () => {
  const [isNavigating, setIsNavigating] = useState(false);
  const pathname = usePathname();

  // Reset loading state when navigation completes
  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  return (
    <>
      {/* Full-screen loading overlay */}
      {isNavigating && (
        <div className="fixed inset-0 bg-dark-100/80 backdrop-blur-sm z-[100] flex flex-col items-center justify-center gap-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary-200/20 rounded-full" />
            <div className="absolute inset-0 w-16 h-16 border-4 border-primary-200 border-t-transparent rounded-full animate-spin" />
          </div>
          <div className="flex flex-col items-center gap-2">
            <h3 className="text-lg font-semibold text-white">
              Loading Admin Dashboard...
            </h3>
            <p className="text-light-400 text-sm">
              Fetching candidate assessments
            </p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div
              className="w-2 h-2 bg-primary-200 rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            />
            <div
              className="w-2 h-2 bg-primary-200 rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            />
            <div
              className="w-2 h-2 bg-primary-200 rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            />
          </div>
        </div>
      )}

      <Link
        href="/admin"
        onClick={() => setIsNavigating(true)}
        className="text-sm font-semibold text-primary-200 bg-dark-200 px-4 py-2 rounded-full hover:bg-dark-200/80 transition-colors"
      >
        Admin Dashboard
      </Link>
    </>
  );
};

export default AdminLink;
