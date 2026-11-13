
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { isDev, mockUser } from "../config/dev";
import { supabase } from "../lib/supabase";
import { getDashboardRouteForRole } from "../utils/roleUtils";
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showDevPanel, setShowDevPanel] = useState(false);

  useEffect(() => {
    const checkExistingSession = async () => {
      if (isDev && localStorage.getItem('user')) {
        navigate(getDashboardRouteForRole(mockUser.role));
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        const role = profile?.role || session.user.user_metadata?.role || 'recruiter';
        navigate(getDashboardRouteForRole(role));
      }
    };

    checkExistingSession();
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isDev) {
        localStorage.setItem("user", JSON.stringify(mockUser));
        navigate(getDashboardRouteForRole(mockUser.role));
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        const role = profile?.role || data.user.user_metadata?.role || 'recruiter';
        localStorage.setItem("user", JSON.stringify({ id: data.user.id, email: data.user.email, role }));
        navigate(getDashboardRouteForRole(role));
      }
    } catch (err) {
      setError(err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-3xl font-bold text-center text-gray-900">Sign in</h2>
        
        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          <div className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Email address"
              disabled={loading}
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <div className="text-sm text-right">
            <Link to="/forgot-password" className="text-blue-600 hover:text-blue-800">
              Forgot your password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? "Signing in" : "Sign in"}
          </button>
        </form>

        {isDev && (
          <div className="mt-6 border-t pt-4">
            <button
              onClick={() => setShowDevPanel(!showDevPanel)}
              className="w-full mb-4 py-2 px-4 rounded bg-yellow-100 text-yellow-800 font-medium hover:bg-yellow-200"
            >
              {showDevPanel ? "Hide Dev Login Panel" : "Show Dev Login Panel"}
            </button>

            {showDevPanel && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  "ceo", "cfo", "recruiter", "client",
                  "candidate", "admin", "sales",
                  "branch", "director"
                ].map((role) => (
                  <button
                    key={role}
                    onClick={() => {
                      const fakeUser = {
                        email: `test.${role}@alltech.com`,
                        role,
                        name: `Test ${role.charAt(0).toUpperCase() + role.slice(1)}`
                      };
                      localStorage.setItem("user", JSON.stringify(fakeUser));
                      navigate(getDashboardRouteForRole(role));
                    }}
                    className="py-2 px-3 rounded bg-gray-200 hover:bg-gray-300 text-sm font-medium"
                  >
                    Log in as {role.charAt(0).toUpperCase() + role.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
