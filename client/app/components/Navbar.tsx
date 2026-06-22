import { Link, useNavigate } from "react-router";
import { usePuterStore } from "lib/puter";
import { useState } from "react";
import { LogOut, User, Menu, X } from "lucide-react";

const Navbar = () => {
  const { auth, isLoading } = usePuterStore();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await auth.signOut();
      navigate("/auth");
    } catch (error) {
      console.error("Error logging out:", error);
    } finally {
      setIsLoggingOut(false);
      setMobileOpen(false);
    }
  };

  const navLinks = auth.isAuthenticated
    ? [
        { to: "/", label: "Home" },
        { to: "/dashboard", label: "Dashboard" },
        { to: "/upload", label: "Upload" },
      ]
    : [{ to: "/", label: "Home" }];

  return (
    <>
      <nav
        className="flex items-center justify-between px-6 lg:px-10 py-4"
        style={{
          backgroundColor: "var(--surface)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        {/* Left — Logo */}
        <Link to="/" className="no-underline">
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.125rem",
              fontWeight: 700,
              color: "var(--stone)",
            }}
          >
            Resume Analyzer
          </span>
        </Link>

        {/* Center — Nav Links (desktop) */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="no-underline transition-colors"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.875rem",
                fontWeight: 400,
                color: "var(--muted)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--stone)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--muted)")
              }
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right — Actions (desktop) */}
        <div className="hidden md:flex items-center gap-3">
          {auth.isAuthenticated ? (
            <>
              <Link to="/profile" className="btn-ghost" style={{ padding: "0.5rem 1rem" }}>
                <User className="w-4 h-4" />
                <span>Profile</span>
              </Link>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut || isLoading}
                className="btn-ghost"
                style={{ padding: "0.5rem 1rem" }}
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <Link to="/auth" className="btn-primary">
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            background: "none",
            border: "none",
            color: "var(--stone)",
            cursor: "pointer",
          }}
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8"
          style={{ backgroundColor: "var(--ink)" }}
        >
          <button
            className="absolute top-5 right-6"
            onClick={() => setMobileOpen(false)}
            style={{
              background: "none",
              border: "none",
              color: "var(--stone)",
              cursor: "pointer",
            }}
          >
            <X className="w-6 h-6" />
          </button>

          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className="no-underline"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "2rem",
                fontWeight: 700,
                color: "var(--stone)",
              }}
            >
              {link.label}
            </Link>
          ))}

          {auth.isAuthenticated ? (
            <>
              <Link
                to="/profile"
                onClick={() => setMobileOpen(false)}
                className="no-underline"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "2rem",
                  fontWeight: 700,
                  color: "var(--stone)",
                }}
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="btn-danger"
                style={{ fontSize: "1rem", padding: "0.75rem 2rem" }}
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              onClick={() => setMobileOpen(false)}
              className="btn-primary"
              style={{ fontSize: "1rem", padding: "0.75rem 2rem" }}
            >
              Sign In
            </Link>
          )}
        </div>
      )}
    </>
  );
};

export default Navbar;
