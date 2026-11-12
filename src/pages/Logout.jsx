
/** 
 * @desc Handles user logout
 * @author Replit Assistant
 * @since 2025-05-12
 */
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Logout() {
  const navigate = useNavigate();
  useEffect(() => {
    localStorage.removeItem("user");
    navigate("/login");
  }, []);
  return null;
}
