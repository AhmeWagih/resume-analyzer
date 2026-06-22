// cspell:ignore puter
import { usePuterStore } from "lib/puter";
import { useEffect, useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router";

export function meta({}) {
  return [
    { title: "Resume Analyzer — Sign In" },
    {
      name: "description",
      content: "Sign in or create an account to analyze your resume.",
    },
  ];
}

const Auth = () => {
  const { isLoading, auth, error, clearError } = usePuterStore();
  const location = useLocation();
  const next = location.search.split("next=")[1];
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (auth.isAuthenticated) navigate(next || "/dashboard");
  }, [auth.isAuthenticated, next, navigate]);

  useEffect(() => {
    if (error) {
      setLocalError(error);
      clearError();
    }
  }, [error, clearError]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalError("");

    if (!email || !password) {
      setLocalError("Email and password are required");
      return;
    }

    if (isRegister) {
      if (password !== confirmPassword) {
        setLocalError("Passwords do not match");
        return;
      }
      if (password.length < 6) {
        setLocalError("Password must be at least 6 characters");
        return;
      }
      await auth.register(email, password);
    } else {
      await auth.signIn(email, password);
    }
  };

  return (
    <main
      className="grain relative min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "var(--ink)" }}
    >
      <div className="relative z-10 w-full max-w-md mx-4">
        <div
          className="p-8 sm:p-10"
          style={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "0.25rem",
            boxShadow: "0 2px 12px rgba(0,0,0,0.6)",
          }}
        >
          {/* App name */}
          <h1
            className="text-center mb-8"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.75rem",
              fontWeight: 700,
              color: "var(--stone)",
            }}
          >
            Resume Analyzer
          </h1>

          {/* Tab toggle */}
          <div
            className="flex mb-8"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <button
              type="button"
              onClick={() => {
                setIsRegister(false);
                setLocalError("");
                setConfirmPassword("");
              }}
              className="flex-1 pb-3 text-center cursor-pointer"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.875rem",
                fontWeight: 500,
                color: !isRegister ? "var(--stone)" : "var(--muted)",
                borderBottom: !isRegister
                  ? "2px solid var(--rust)"
                  : "2px solid transparent",
                background: "none",
                border: "none",
                borderBottomWidth: "2px",
                borderBottomStyle: "solid",
                borderBottomColor: !isRegister
                  ? "var(--rust)"
                  : "transparent",
                transition: "color 0.2s, border-color 0.2s",
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegister(true);
                setLocalError("");
              }}
              className="flex-1 pb-3 text-center cursor-pointer"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.875rem",
                fontWeight: 500,
                color: isRegister ? "var(--stone)" : "var(--muted)",
                background: "none",
                border: "none",
                borderBottomWidth: "2px",
                borderBottomStyle: "solid",
                borderBottomColor: isRegister
                  ? "var(--rust)"
                  : "transparent",
                transition: "color 0.2s, border-color 0.2s",
              }}
            >
              Register
            </button>
          </div>

          {/* Error */}
          {localError && (
            <div
              className="mb-6 px-4 py-3 text-sm"
              style={{
                backgroundColor: "rgba(184, 85, 85, 0.1)",
                border: "1px solid var(--deep-red)",
                borderRadius: "0.25rem",
                color: "var(--deep-red)",
                fontFamily: "var(--font-body)",
              }}
            >
              {localError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="auth-email">Email</label>
              <input
                id="auth-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="auth-password">Password</label>
              <input
                id="auth-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={
                  isRegister ? "new-password" : "current-password"
                }
                required
                minLength={6}
              />
            </div>

            {isRegister && (
              <div className="flex flex-col gap-1.5">
                <label htmlFor="auth-confirm-password">
                  Confirm Password
                </label>
                <input
                  id="auth-confirm-password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  minLength={6}
                />
              </div>
            )}

            {isLoading ? (
              <button className="btn-primary w-full opacity-60" disabled>
                {isRegister ? "Creating account..." : "Signing in..."}
              </button>
            ) : auth.isAuthenticated ? (
              <button
                className="btn-danger w-full"
                onClick={auth.signOut}
                type="button"
              >
                Log Out
              </button>
            ) : (
              <button className="btn-primary w-full" type="submit">
                {isRegister ? "Create Account" : "Sign In"}
              </button>
            )}
          </form>
        </div>
      </div>
    </main>
  );
};

export default Auth;
