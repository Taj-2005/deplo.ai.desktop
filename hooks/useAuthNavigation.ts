"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export function useAuthNavigation() {
  const { isAuthenticated, signIn } = useAuth();
  const router = useRouter();

  function launchApp(): void {
    const desktopWindow = window as Window & { desktop?: { isElectron?: boolean } };
    if (!desktopWindow.desktop?.isElectron) {
      window.location.href = "deplo://launch";
      return;
    }

    if (isAuthenticated) {
      router.push("/dashboard");
    } else {
      signIn();
    }
  }

  function connectGithub(): void {
    if (isAuthenticated) {
      router.push("/dashboard");
    } else {
      signIn();
    }
  }

  return { isAuthenticated, launchApp, connectGithub };
}
