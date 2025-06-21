import CloudinaryImage from "@/components/CloudinaryImage";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, Menu, Settings, User, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const Header = () => {
  const { user, isAdmin, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <CloudinaryImage
              fileName="logoRound_1_yn0smh.png"
              alt="Chemouflage Logo"
              className="w-10 h-10 object-contain"
              width={40}
              height={40}
            />
            <span className="text-xl font-bold text-foreground">Chemouflage</span>
          </div>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6">
          <Link
            to="/"
            className="text-foreground hover:text-teal-500 transition-colors"
          >
            Home
          </Link>
          <Link
            to="/checkout"
            className="text-foreground hover:text-teal-500 transition-colors"
          >
            Buy Cards
          </Link>
          {user && (
            <Link
              to="/my-orders"
              className="text-foreground hover:text-teal-500 transition-colors"
            >
              My Orders
            </Link>
          )}
          <Link
            to="/track-order"
            className="text-foreground hover:text-teal-500 transition-colors"
          >
            Track Order
          </Link>
          <Link
            to="/contact"
            className="text-foreground hover:text-teal-500 transition-colors"
          >
            Contact
          </Link>
        </div>

        {/* Desktop Auth Section */}
        <div className="hidden md:flex items-center space-x-4">
          <ThemeToggle className="text-foreground" />
          {user ? (
            <>
              <span className="text-foreground hidden lg:inline">
                Welcome, {user.email}
              </span>
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Admin
                  </Button>
                </Link>
              )}
              <Button
                onClick={logout}
                variant="ghost"
                size="sm"
                className="text-foreground hover:bg-teal-100/50 dark:hover:bg-teal-900/50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </>
          ) : (
            <Link to="/login">
              <Button className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 dark:bg-white dark:text-gray-800 dark:hover:bg-gray-100">
                <User className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-foreground p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-4 bg-background/95 backdrop-blur-lg rounded-lg border border-teal-500/30 p-4">
          <div className="flex flex-col space-y-4">
            {/* Mobile Navigation Links */}
            <Link
              to="/"
              className="text-foreground hover:text-teal-500 transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/checkout"
              className="text-foreground hover:text-teal-500 transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Products
            </Link>
            {user && (
              <Link
                to="/my-orders"
                className="text-foreground hover:text-teal-500 transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                My Orders
              </Link>
            )}
            <Link
              to="/track-order"
              className="text-foreground hover:text-teal-500 transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Track Order
            </Link>
            <Link
              to="/contact"
              className="text-foreground hover:text-teal-500 transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contact
            </Link>
            {/* Mobile Auth Section */}
            <div className="border-t border-teal-500/30 pt-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-foreground text-sm">Theme</span>
                <ThemeToggle />
              </div>
              {user ? (
                <div className="space-y-3">
                  <div className="text-foreground text-sm">
                    Welcome, {user.email}
                  </div>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full bg-background dark:bg-white dark:text-gray-800"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Admin
                      </Button>
                    </Link>
                  )}
                  <Button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    variant="ghost"
                    size="sm"
                    className="w-full text-foreground hover:bg-teal-100/50 dark:hover:bg-teal-900/50"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              ) : (
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 dark:bg-white dark:text-gray-800 dark:hover:bg-gray-100">
                    <User className="w-4 h-4 mr-2" />
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Header;
