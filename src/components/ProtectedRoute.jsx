
import { Navigate } from "react-router-dom";
import { hasAccess } from "../utils/roleUtils";

function ProtectedRoute({ allowedRoles, children }) {
  const accessGranted = hasAccess(allowedRoles);

  if (!accessGranted) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
