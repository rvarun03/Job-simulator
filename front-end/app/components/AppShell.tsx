"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";
import {
  getAuthSessionFromSnapshot,
  getAuthSessionSnapshot,
  getServerAuthSessionSnapshot,
  subscribeToAuthSession,
} from "../lib/api";
import Navbar from "./Navbar";

const authPaths = new Set(["/login", "/register"]);
const hrPaths = ["/candidate-ranking"];
const userPaths = [
  "/resume/upload",
  "/Cover_letter",
  "/Job_match",
  "/Resume_Improvements",
  "/Chat",
];

const matchesPath = (pathname: string, paths: string[]) => (
  paths.some((path) => pathname === path || pathname.startsWith(`${path}/`))
);

export default function AppShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const authSessionSnapshot = useSyncExternalStore(
    subscribeToAuthSession,
    getAuthSessionSnapshot,
    getServerAuthSessionSnapshot
  );
  const session = getAuthSessionFromSnapshot(authSessionSnapshot);
  const isAuthPath = authPaths.has(pathname);
  const isAllowed = isAuthPath
    ? !session
    : Boolean(
        session
        && (pathname === "/"
          || (session.role === "HR" && matchesPath(pathname, hrPaths))
          || (session.role === "USER" && matchesPath(pathname, userPaths)))
      );

  useEffect(() => {
    if (!session && !isAuthPath) {
      router.replace("/login");
      return;
    }

    if (session && isAuthPath) {
      router.replace("/");
      return;
    }

    if (session && !isAllowed) {
      router.replace("/");
    }
  }, [isAllowed, isAuthPath, router, session]);

  if (!isAllowed) {
    return null;
  }

  return (
    <>
      {session && <Navbar />}
      <main className="flex-1">{children}</main>
    </>
  );
}
