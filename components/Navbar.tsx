"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

interface NavbarProps {
  userName: string;
  userInitial: string;
  isAdmin: boolean;
}

const Navbar = ({ userName, userInitial, isAdmin }: NavbarProps) => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Reset navigation state and close mobile menu on route change
  useEffect(() => {
    setNavigatingTo(null);
    setMobileMenuOpen(false);
  }, [pathname]);

  // Close mobile menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = isAdmin
    ? [{ href: "/admin", label: "Admin Dashboard" }]
    : [
        { href: "/", label: "Home" },
        { href: "/interview", label: "Start Interview" },
      ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const handleNavClick = (href: string) => {
    if (pathname !== href) {
      setNavigatingTo(href);
    }
  };

  return (
    <>
      {/* Loading overlay during navigation */}
      {navigatingTo && (
        <div className="fixed inset-0 bg-white/70 backdrop-blur-sm z-[200] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 border-3 border-cue-yellow/20 rounded-full" />
              <div className="absolute inset-0 w-12 h-12 border-3 border-cue-yellow border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-sm text-cue-text-light">Loading...</p>
          </div>
        </div>
      )}

      <header
        className="fixed top-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-xl border-b border-cue-border/50"
        ref={menuRef}
      >
        <nav className="flex items-center justify-between max-w-7xl mx-auto px-6 py-3 max-sm:px-4">
          {/* Logo */}
          <Link href={isAdmin ? "/admin" : "/"} className="flex items-center gap-2.5 group">
            <Image
              src="/logo.svg"
              alt="CueHire Logo"
              width={34}
              height={28}
              className="transition-transform duration-300 group-hover:scale-110"
            />
            <span className="text-cue-dark text-lg font-bold tracking-tight">
              CueHire
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => handleNavClick(link.href)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  isActive(link.href)
                    ? "text-cue-dark bg-cue-yellow shadow-sm"
                    : "text-cue-text-light hover:text-cue-dark hover:bg-gray-100"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* User Section */}
          <div className="flex items-center gap-3">
            {/* User avatar & name (desktop) */}
            <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-gray-50 border border-cue-border">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cue-yellow to-cue-yellow-hover flex items-center justify-center text-xs font-bold text-white">
                {userInitial}
              </div>
              <span className="text-sm text-cue-text font-medium">
                {userName}
              </span>
            </div>

            {/* Sign Out - desktop */}
            <div className="hidden md:block">
              <SignOutBtn />
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              <span
                className={`w-5 h-0.5 bg-cue-dark rounded-full transition-all duration-300 origin-center ${
                  mobileMenuOpen ? "rotate-45 translate-y-2" : ""
                }`}
              />
              <span
                className={`w-5 h-0.5 bg-cue-dark rounded-full transition-all duration-300 ${
                  mobileMenuOpen ? "opacity-0 scale-0" : ""
                }`}
              />
              <span
                className={`w-5 h-0.5 bg-cue-dark rounded-full transition-all duration-300 origin-center ${
                  mobileMenuOpen ? "-rotate-45 -translate-y-2" : ""
                }`}
              />
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        <div
          className={`md:hidden transition-all duration-300 ease-out overflow-hidden ${
            mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-6 pb-4 max-sm:px-4">
            <div className="p-3 rounded-2xl bg-gray-50 border border-cue-border">
              {/* Mobile user info */}
              <div className="flex items-center gap-3 px-3 py-3 mb-2 rounded-xl bg-white">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cue-yellow to-cue-yellow-hover flex items-center justify-center text-sm font-bold text-white">
                  {userInitial}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-cue-dark font-medium">
                    {userName}
                  </span>
                  <span className="text-xs text-cue-text-light">Logged in</span>
                </div>
              </div>

              {/* Mobile nav links */}
              <div className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => {
                      handleNavClick(link.href);
                      setMobileMenuOpen(false);
                    }}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive(link.href)
                        ? "text-cue-dark bg-cue-yellow"
                        : "text-cue-text-light hover:text-cue-dark hover:bg-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Mobile sign out */}
              <div className="mt-2 pt-2 border-t border-cue-border">
                <SignOutBtn />
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

// Extracted sign out button
function SignOutBtn() {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      const { signOut: firebaseSignOut } = await import("firebase/auth");
      const { auth } = await import("@/firebase/client");
      const { signOut } = await import("@/lib/actions/auth.action");
      await firebaseSignOut(auth);
      await signOut();
      router.push("/sign-in");
    } catch (error) {
      console.error("Error signing out:", error);
      setSigningOut(false);
    }
  };

  return (
    <button
      onClick={handleSignOut}
      disabled={signingOut}
      className="flex items-center gap-2 text-sm font-medium text-cue-text-light hover:text-cue-pink px-4 py-2 rounded-full hover:bg-cue-pink-light transition-all duration-200 cursor-pointer disabled:opacity-50 w-full md:w-auto"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
      {signingOut ? "Signing out..." : "Sign Out"}
    </button>
  );
}

export default Navbar;
