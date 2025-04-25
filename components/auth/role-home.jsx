
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function RoleHome() {
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (!user) return navigate("/login");

    const roleRoutes = {
      admin: "/admin-dashboard",
      recruiter: "/recruiter-dashboard",
      sales_rep: "/sales-dashboard",
      client: "/client-approvals",
      executive: "/executive-dashboard"
    };

    navigate(roleRoutes[user.role] || "/");
  }, [navigate]);

  return <div className="p-4">Redirecting...</div>;
}
