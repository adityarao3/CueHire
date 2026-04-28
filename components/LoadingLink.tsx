"use client";

import { useRouter } from "next/navigation";
import { useState, ReactNode } from "react";

interface LoadingLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
}

/**
 * A link component that shows a full-page loading overlay
 * while navigating to the target page.
 */
const LoadingLink = ({ href, children, className }: LoadingLinkProps) => {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsNavigating(true);
    router.push(href);
  };

  return (
    <>
      {/* Full-page loading overlay */}
      {isNavigating && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[300] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 border-4 border-cue-yellow/20 rounded-full" />
              <div className="absolute inset-0 w-14 h-14 border-4 border-cue-yellow border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-sm font-medium text-cue-text-light animate-pulse">
              Loading...
            </p>
          </div>
        </div>
      )}

      <button onClick={handleClick} className={className} disabled={isNavigating}>
        {children}
      </button>
    </>
  );
};

export default LoadingLink;
