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
  logoutAllDevices: () => Promise<void>;
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
      // Get access token from auth service instead of directly from localStorage
      const accessToken = localStorage.getItem("auth_access_token");
      const refreshToken = localStorage.getItem("auth_refresh_token");

      if (!accessToken && !refreshToken) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await authService.getCurrentUser();
      if (error) {
        console.error("Auth check failed:", error);
        // If we get a specific authentication error and not a network error,
        // we should clear the user from state
        if (
          error.includes("401") ||
          error.includes("Unauthorized") ||
          error.includes("Failed to refresh authentication")
        ) {
          // The auth service already handles token removal internally
          setUser(null);
        }
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
      await authService.logout();
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
  }; // Add a method to logout from all devices
  const logoutAllDevices = async () => {
    try {
      await authService.logout(true); // true = logout from all devices
      setUser(null);
      toast({
        title: "Logged out from all devices",
        description: "You have been successfully logged out from all devices.",
      });
    } catch (error) {
      console.error("Error during logout:", error);
      toast({
        title: "Logout Error",
        description: "There was an error logging out from all devices.",
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
        logoutAllDevices,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
