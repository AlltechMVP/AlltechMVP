
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import NavBar from '../components/common/navbar';
import Footer from '../components/common/footer';
import LandingPage from "./components/common/LandingPage";
import Login from "../components/common/login";
import RecruiterDashboard from "../components/recruiter/dashboard";
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getSession } from "./utils/auth";

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    async function checkAuth() {
      const { session } = await getSession();
      if (!session) {
        if (location.pathname !== "/login" && location.pathname !== "/signup") {
          navigate("/login");
        }
      }
    }
    checkAuth();
  }, [navigate, location]);

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/recruiter" element={<RecruiterDashboard />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
