import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  /** If true, only users with role code "worker" can access. */
  requireWorker?: boolean;
}

export function ProtectedRoute({ children, requireWorker }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <p style={{ padding: "2rem", textAlign: "center" }}>Загрузка...</p>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireWorker && user?.role?.code !== "worker") {
    return <Navigate to="/catalog" replace />;
  }

  return <>{children}</>;
}
