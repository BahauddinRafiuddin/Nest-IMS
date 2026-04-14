import useAuth from "../../hooks/useAuth";
import { Navigate, Outlet } from "react-router-dom";

const RoleRoute = ({allowedRoles}) => {
  const { user } = useAuth();
  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

export default RoleRoute;
