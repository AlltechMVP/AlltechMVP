import React, { useState } from "react";
import { supabase } from "../../utils/supabaseClient";

export default function Login() {
  console.log("📍 Login page loaded");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState("");

  const log = (message) => {
    console.log(message);
    setLogs((prev) => [...prev, message]);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    log("🔐 Attempting login...");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    log("🧾 Supabase response:");
    log(JSON.stringify({ data, error }, null, 2));

    if (error) {
      setStatus("❌ Login failed: " + error.message);
      return;
    }

    if (data && data.user) {
      setStatus("✅ Login successful for: " + data.user.email);
      log("📦 User stored in localStorage.");
      localStorage.setItem("user", JSON.stringify(data.user));
    } else {
      setStatus("⚠️ Login did not return a user.");
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">🔐 Debug Login Page</h2>
      <form onSubmit={handleLogin} className="space-y-2">
        <input
          type="email"
          placeholder="Email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 w-full"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Log In
        </button>
      </form>

      <div className="mt-4">
        <strong>Status:</strong> {status}
      </div>

      <div className="mt-4 bg-gray-100 p-2 text-sm whitespace-pre-wrap">
        <strong>Logs:</strong>
        {logs.map((l, i) => (
          <div key={i}>{l}</div>
        ))}
      </div>
    </div>
  );
}