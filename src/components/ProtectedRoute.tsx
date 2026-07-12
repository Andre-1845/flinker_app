import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("worker" | "company" | "admin")[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, loading, effectiveRole } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  // Allow access if user is authenticated OR has a guest role
  const hasAccess = user || effectiveRole;

  if (!hasAccess) {
    return <Navigate to="/" replace />;
  }

  // Check role-based access using effectiveRole (auth role takes priority, falls back to guest)
  if (allowedRoles && effectiveRole && !allowedRoles.includes(effectiveRole)) {
    return <Navigate to={effectiveRole === "company" ? "/company-dashboard" : "/dashboard"} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
