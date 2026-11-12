import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import NavBar from '../components/common/navbar';
import Footer from '../components/common/footer';
import LandingPage from "./components/common/LandingPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import AuthRoute from "./components/AuthRoute";

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/recruiter"
            element={
              <AuthRoute>
                <RecruiterDashboard />
              </AuthRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
