import { useAuth } from "@/lib/AuthProvider";
import { Navigate, useLocation } from "react-router-dom";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null; // Or a loading spinner
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
} 