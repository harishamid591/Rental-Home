import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";


const ProtectedRoute = ({ allowedRoles, children }) => {
  const user = useSelector((state) => state.auth.user);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />; // fallback page
  }

  return children;
};

export default ProtectedRoute;
