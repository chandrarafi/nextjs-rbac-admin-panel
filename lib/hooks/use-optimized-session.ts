import { useSession } from "next-auth/react";
import { useMemo } from "react";

/**
 * Optimized session hook that prevents unnecessary re-renders
 * and reduces session checks
 */
export function useOptimizedSession() {
  const { data: session, status } = useSession();

  // Memoize session data to prevent unnecessary re-renders
  const memoizedSession = useMemo(
    () => session,
    [session?.user?.id, session?.user?.email]
  );

  return {
    session: memoizedSession,
    status,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    user: memoizedSession?.user,
  };
}
