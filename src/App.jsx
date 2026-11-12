import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import NavBar from '../components/common/navbar';
import Footer from '../components/common/footer';
import LandingPage from "./components/common/LandingPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AuthRoute from "./components/AuthRoute";
import { appRoutes } from "./routes";

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-grow">
        <Suspense fallback={<div className="p-6">Loading...</div>}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            {appRoutes.map(({ path, Component }) => (
              <Route
                key={path}
                path={path}
                element={
                  <AuthRoute>
                    <Component />
                  </AuthRoute>
                }
              />
            ))}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

export default App;
