import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { Role } from "../types/auth";

interface ProtectedRouteProps {
  allowedRoles?: Role[];
}

function ProtectedRoute({
  allowedRoles,
}: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (
    allowedRoles &&
    !allowedRoles.includes(user.role)
  ) {
    switch (user.role) {
      case "ADMIN":
        return <Navigate to="/admin" replace />;

      case "FORMATEUR":
        return <Navigate to="/formateur" replace />;

      case "APPRENANT":
        return <Navigate to="/apprenant" replace />;

      default:
        return <Navigate to="/login" replace />;
    }
  }

  return <Outlet />;
}

export default ProtectedRoute;