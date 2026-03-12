import { Navigate, Outlet } from "react-router";
import useAuth from "../../../stores/store";

const Unprotected = () => {
  const checkLogin = useAuth((state) => state.checkLogin);
  const user = useAuth((state) => state.user);

  if (checkLogin()) {
    const role = user?.roles?.[0];
    console.log(role)
    const redirectRoute =
      role === "ROLE_ADMIN"
        ? "/admin"
        : role === "ROLE_USER"
        ? "/student/dashboard"
        : "/dashboard"; 

    return <Navigate to={redirectRoute} replace />;
  }

  return <Outlet />;
};

export default Unprotected;