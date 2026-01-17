import { Navigate, Outlet } from "react-router";
import useAuth from "../../../stores/store";

const Unprotected = () => {
  const checkLogin = useAuth(
    (state) => state.checkLogin 
  );

  if (checkLogin()) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default Unprotected;
