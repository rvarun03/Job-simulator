"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import {
  clearAuthSession,
  getAuthSessionFromSnapshot,
  getAuthSessionSnapshot,
  getServerAuthSessionSnapshot,
  subscribeToAuthSession,
} from "../lib/api";

const guestNavItems = [
  { href: "/login", label: "Login" },
  { href: "/register", label: "Register" },
];

const toolNavItems = [
  { href: "/resume/upload", label: "Upload Resume" },
  { href: "/Cover_letter", label: "Cover Letter" },
  { href: "/Job_match", label: "Job Match" },
  { href: "/Resume_Improvements", label: "Resume Improvements" },
  { href: "/candidate-ranking", label: "Candidate Ranking" },
  { href: "/Chat", label: "Chat" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const authSessionSnapshot = useSyncExternalStore(
    subscribeToAuthSession,
    getAuthSessionSnapshot,
    getServerAuthSessionSnapshot
  );
  const session = getAuthSessionFromSnapshot(authSessionSnapshot);

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + "/");
  };

  const navItems = [
    { href: "/", label: "Home" },
    ...(!session ? guestNavItems : []),
    ...toolNavItems,
  ];

  const linkClassName = (href: string, isMobile = false) => (
    `${isMobile ? "block " : ""}px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive(href)
        ? "bg-blue-600 text-white"
        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
    }`
  );

  const logoutButtonClassName = (isMobile = false) => (
    `${isMobile ? "w-full text-left " : ""}px-3 py-2 rounded-md text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950/40`
  );

  const handleLogout = () => {
    clearAuthSession();
    setIsMobileMenuOpen(false);
    router.push("/login");
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-16 items-center justify-between gap-4 py-3">
          {/* Logo/Brand */}
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="text-2xl font-bold text-blue-600 dark:text-blue-400"
            >
              AI Job Automation
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-8 flex flex-wrap items-center gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={linkClassName(item.href)}
                >
                  {item.label}
                </Link>
              ))}
              {session && (
                <button
                  type="button"
                  onClick={handleLogout}
                  className={logoutButtonClassName()}
                >
                  Logout
                </button>
              )}
            </div>
          </div>

          {/* Mobile menu button (optional - can be expanded later) */}
          <div className="md:hidden">
            <button
              type="button"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen((current) => !current)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <svg
                className="h-6 w-6"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={isMobileMenuOpen ? "M6 18 18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </button>
          </div>
        </div>
        {isMobileMenuOpen && (
          <div className="border-t border-gray-200 pb-3 pt-3 dark:border-gray-800 md:hidden">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={linkClassName(item.href, true)}
                >
                  {item.label}
                </Link>
              ))}
              {session && (
                <button
                  type="button"
                  onClick={handleLogout}
                  className={logoutButtonClassName(true)}
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
