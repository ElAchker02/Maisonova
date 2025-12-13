import { ReactNode, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

interface RequireSuperAdminProps {
  children: ReactNode;
}

export const RequireSuperAdmin = ({ children }: RequireSuperAdminProps) => {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const hydrateUser = useAuthStore((state) => state.hydrateUser);
  const location = useLocation();

  useEffect(() => {
    if (token && !user) {
      void hydrateUser();
    }
  }, [token, user, hydrateUser]);

  if (!token) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  if (user && user.role !== "superadmin") {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};
