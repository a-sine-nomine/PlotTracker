import { Navigate } from "react-router-dom";
import { useUser } from "../UserProvider";

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useUser();

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated) {
    return children;
  } else {
    console.error("PrivateRoute: Redirecting to login page.");
    return <Navigate to="/login" replace />;
  }
};

export default PrivateRoute;
