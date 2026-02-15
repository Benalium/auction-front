import { useEffect } from "react";
import { useAuth } from "../auth/AuthContext";
import { useAuthModal } from "../context/AuthModalContext";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const { openLogin } = useAuthModal();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      openLogin();
    }
  }, [isLoading, isAuthenticated, openLogin]);

  if (isLoading) {
    return <p style={{ padding: "2rem", textAlign: "center" }}>Загрузка...</p>;
  }

  if (!isAuthenticated) {
    return (
      <p style={{ padding: "2rem", textAlign: "center", color: "var(--color-text-secondary)" }}>
        Войдите в систему для доступа к этой странице.
      </p>
    );
  }

  return <>{children}</>;
}
