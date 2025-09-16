import { useDispatch, useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import { clearUser } from "../features/auth/authSlice";
import { useEffect } from "react";


const ProtectedRoute = ({ allowedRoles, children }) => {
  const user = useSelector((state) => state.auth.user);


  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      dispatch(clearUser());
    }
  }, [location, dispatch]); // runs whenever route changes

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />; // fallback page
  }

  return children;
};

export default ProtectedRoute;
