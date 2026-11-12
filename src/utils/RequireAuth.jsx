
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

export default function RequireAuth({ allowedRoles = [], children }) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const stored = localStorage.getItem("user");
      if (!stored) return setAuthorized(false);

      try {
        const user = JSON.parse(stored);
        if (!allowedRoles.length || allowedRoles.includes(user.role)) {
          setAuthorized(true);
        }
      } catch {
        setAuthorized(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [allowedRoles]);

  if (loading) {
    return <div className="text-center py-6 text-gray-500">Checking access</div>;
  }

  return authorized ? children : <Navigate to="/login" replace />;
}
