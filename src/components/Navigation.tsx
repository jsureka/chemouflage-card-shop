
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { User, ShoppingCart } from "lucide-react";

export const Navigation = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/10 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div 
          className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent cursor-pointer"
          onClick={() => navigate('/')}
        >
          Chemouflage
        </div>
        
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/profile')}
                className="text-white hover:bg-white/10"
              >
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-white hover:bg-white/10"
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/login')}
                className="text-white hover:bg-white/10"
              >
                Login
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/register')}
                className="text-white hover:bg-white/10"
              >
                Register
              </Button>
            </>
          )}
          <Button
            size="sm"
            onClick={() => navigate('/checkout')}
            className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Order Now
          </Button>
        </div>
      </div>
    </nav>
  );
};
