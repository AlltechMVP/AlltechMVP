import { Link } from "react-router-dom";

// Public self-registration is closed (ATS/CRM milestone, Slice 0, option B).
// Accounts are created by an administrator. This page exists so old links
// land on a clear message instead of a dead end — it creates no account
// and writes nothing to localStorage.
function Signup() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl mb-4">Sign Up</h1>
      <div className="flex flex-col gap-4 w-80 text-center">
        <p className="text-gray-700">
          Accounts are provided by your administrator. Sign in with the
          account you were given.
        </p>
        <Link
          to="/login"
          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors"
        >
          Go to sign in
        </Link>
      </div>
      <p className="mt-4 text-sm text-gray-600">
        Already have an account?{" "}
        <Link to="/login" className="text-blue-600 hover:text-blue-500">
          Log in
        </Link>
      </p>
    </div>
  );
}

export default Signup;
