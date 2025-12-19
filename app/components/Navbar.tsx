import { Link, useNavigate } from "react-router";
import { usePuterStore } from "lib/puter";
import { useState } from "react";
import { LogOut, User } from "lucide-react";

const Navbar = () => {
  const { auth, isLoading } = usePuterStore();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await auth.signOut();
      navigate("/auth");
    } catch (error) {
      console.error("Error logging out:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <nav className="navbar">
      <Link to="/">
        <p className="text-2xl font-bold text-gradient">My Resume</p>
      </Link>

      <div className="flex flex-row items-center gap-4">
        {auth.isAuthenticated && (
          <div className="flex flex-row items-center gap-3">
            <Link
              to="/profile"
              className="flex items-center cursor-pointer justify-center w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
            >
              <User className="w-5 h-5 text-black" />
            </Link>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut || isLoading}
              className="flex items-center cursor-pointer justify-center w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
              title="Logout"
            >
              <LogOut className="w-5 h-5 text-black" />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
