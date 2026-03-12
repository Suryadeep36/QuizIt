import { Navigate, Outlet } from "react-router-dom";
import useAuth from "./stores/store"; 

const RoleProtectedRoute = ({ allowedRoles }) => {
  const user = useAuth((state) => state.user);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const roles = user.roles || [];
  const hasAccess = roles.some((role) => allowedRoles.includes(role));
  if (!hasAccess) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default RoleProtectedRoute;