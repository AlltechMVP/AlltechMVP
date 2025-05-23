
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signup } from "../utils/auth";

function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error } = await signup(email, password);
    if (error) {
      setError(error.message);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl mb-4">Sign Up</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-80">
        <input 
          type="email" 
          placeholder="Email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button 
          type="submit"
          className="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition-colors"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
}

export default Signup;
