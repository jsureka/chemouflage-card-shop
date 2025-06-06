import { useToast } from "@/hooks/use-toast";
import { authService, User } from "@/services";
import React, { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const isAdmin = user?.role === "admin";
  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await authService.getCurrentUser();
      if (error) {
        console.error("Auth check failed:", error);
        // Only remove token if it's a 401 (unauthorized) error
        // Keep token for network errors to retry later
        if (error.includes("401") || error.includes("Unauthorized")) {
          localStorage.removeItem("auth_token");
        }
        setUser(null);
      } else if (data) {
        setUser(data);
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
      // Don't remove token on network errors, user might be offline
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await authService.login(email, password);
      if (error) {
        toast({
          title: "Login Failed",
          description: error,
          variant: "destructive",
        });
        throw new Error(error);
      }

      if (data) {
        setUser(data.user);
        toast({
          title: "Welcome back!",
          description: "You have been successfully logged in.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };
  const register = async (
    email: string,
    password: string,
    fullName: string
  ) => {
    setIsLoading(true);
    try {
      const { data, error } = await authService.register(
        email,
        password,
        fullName
      );
      if (error) {
        toast({
          title: "Registration Failed",
          description: error,
          variant: "destructive",
        });
        throw new Error(error);
      }

      if (data) {
        toast({
          title: "Registration Successful!",
          description: "Please log in with your new account.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };
  const logout = async () => {
    try {
      authService.logout();
      setUser(null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      console.error("Error during logout:", error);
      toast({
        title: "Logout Error",
        description: "There was an error logging out.",
        variant: "destructive",
      });
    }
  };

  const refreshAuth = async () => {
    await checkAuthStatus();
  };
  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAdmin,
        login,
        register,
        logout,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
