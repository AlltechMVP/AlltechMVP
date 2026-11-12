import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../src/lib/supabase";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  console.log("📍 Login page loaded");

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log("🔐 Starting login...");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log("🧾 Supabase response:", { data, error });

    if (error) {
      console.error("❌ Login failed:", error.message);
      setErrorMsg("Login failed. Please check your credentials.");
      return;
    }

    if (data && data.session && data.session.user) {
      console.log("✅ Login successful. User:", data.session.user);
      localStorage.setItem("user", JSON.stringify(data.session.user));
      console.log("📦 User saved to localStorage.");
      navigate("/recruiter");
      console.log("➡️ Redirecting to /recruiter...");
    } else {
      console.warn("⚠️ Login succeeded but user info not found.");
      setErrorMsg("Login completed, but no user info returned.");
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          value={email}
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          value={password}
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
        {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
      </form>
    </div>
  );
}

export default Login;