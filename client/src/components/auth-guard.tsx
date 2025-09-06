import { useEffect } from "react";
import { useLocation } from "wouter";
import { useCurrentUser } from "@/lib/auth";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  redirectTo?: string;
}

export default function AuthGuard({ 
  children, 
  requireAuth = false, 
  requireAdmin = false, 
  redirectTo 
}: AuthGuardProps) {
  const [, setLocation] = useLocation();
  const { data: currentUser, isLoading } = useCurrentUser();

  useEffect(() => {
    if (isLoading) return; // Still loading, don't redirect yet

    if (requireAuth && !currentUser?.user) {
      setLocation("/login");
      return;
    }

    if (requireAdmin && currentUser?.user?.role !== "admin") {
      setLocation("/student-dashboard");
      return;
    }

    if (redirectTo && currentUser?.user) {
      if (currentUser.user.role === "admin") {
        setLocation("/admin-dashboard");
      } else {
        setLocation("/student-dashboard");
      }
    }
  }, [currentUser, isLoading, requireAuth, requireAdmin, redirectTo, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (requireAuth && !currentUser?.user) {
    return null; // Will redirect to login
  }

  if (requireAdmin && currentUser?.user?.role !== "admin") {
    return null; // Will redirect to student dashboard
  }

  return <>{children}</>;
}

// Hook for automatic routing based on authentication status
export function useAuthRouting() {
  const [, setLocation] = useLocation();
  const { data: currentUser, isLoading } = useCurrentUser();

  useEffect(() => {
    if (isLoading || !currentUser?.user) return;

    // If user is authenticated, redirect to appropriate dashboard
    if (currentUser.user.role === "admin") {
      setLocation("/admin-dashboard");
    } else {
      setLocation("/student-dashboard");
    }
  }, [currentUser, isLoading, setLocation]);

  return { currentUser, isLoading };
}
