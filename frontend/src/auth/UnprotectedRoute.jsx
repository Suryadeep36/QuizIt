import { Navigate, Outlet } from "react-router";
import useAuth from "./store";

const UnprotectedRoute = () => {
  const checkLogin = useAuth(
    (state) => state.checkLogin 
  );

  if (checkLogin()) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default UnprotectedRoute;
