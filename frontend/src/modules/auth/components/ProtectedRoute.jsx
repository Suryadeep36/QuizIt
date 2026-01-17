import { Navigate, Outlet } from "react-router";
import useAuth from "../../../stores/store";


const ProtectedRoute = () => {
  const checkLogin = useAuth((state)=>state.checkLogin);

  if (!checkLogin()) {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
