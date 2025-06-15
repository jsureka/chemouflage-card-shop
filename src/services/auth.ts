import { ApiResponse, User } from "./types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

interface AuthTokens {
  access_token: string;
  refresh_token: string;
  user: User;
}

class AuthService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private refreshPromise: Promise<boolean> | null = null;

  constructor() {
    // Load tokens from localStorage on initialization
    this.accessToken = localStorage.getItem("auth_access_token");
    this.refreshToken = localStorage.getItem("auth_refresh_token");
  }

  private setAuthHeader(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (this.accessToken) {
      headers["Authorization"] = `Bearer ${this.accessToken}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    try {
      if (response.status === 204) {
        return { data: undefined as T };
      }

      const data = await response.json();

      if (!response.ok) {
        return { error: data.detail || data.message || "An error occurred" };
      }

      return { data };
    } catch (error) {
      return { error: "Failed to process response" };
    }
  }

  async login(
    email: string,
    password: string
  ): Promise<
    ApiResponse<{ user: User; access_token: string; refresh_token: string }>
  > {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        username: email,
        password: password,
      }),
    });

    const result = await this.handleResponse<AuthTokens>(response);

    if (result.data?.access_token && result.data?.refresh_token) {
      this.accessToken = result.data.access_token;
      this.refreshToken = result.data.refresh_token;
      localStorage.setItem("auth_access_token", this.accessToken);
      localStorage.setItem("auth_refresh_token", this.refreshToken);
    }

    return result;
  }

  async firebaseLogin(
    idToken: string
  ): Promise<
    ApiResponse<{ user: User; access_token: string; refresh_token: string }>
  > {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/firebase-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_token: idToken }),
    });

    const result = await this.handleResponse<AuthTokens>(response);
    if (result.data?.access_token && result.data?.refresh_token) {
      this.accessToken = result.data.access_token;
      this.refreshToken = result.data.refresh_token;
      localStorage.setItem("auth_access_token", this.accessToken);
      localStorage.setItem("auth_refresh_token", this.refreshToken);
    }
    return result;
  }

  async register(
    email: string,
    password: string,
    fullName: string
  ): Promise<ApiResponse<User>> {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        full_name: fullName,
      }),
    });

    return this.handleResponse<User>(response);
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    if (!this.accessToken) {
      if (this.refreshToken) {
        // Try to refresh the token first
        const refreshed = await this.refreshAccessToken();
        if (!refreshed) {
          return { error: "Failed to refresh authentication" };
        }
      } else {
        return { error: "No authentication token" };
      }
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
      headers: this.setAuthHeader(),
    });

    // If unauthorized, try to refresh the token
    if (response.status === 401 && this.refreshToken) {
      const refreshed = await this.refreshAccessToken();
      if (!refreshed) {
        return { error: "Failed to refresh authentication" };
      }

      // Retry with new token
      const retryResponse = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
        headers: this.setAuthHeader(),
      });

      return this.handleResponse<User>(retryResponse);
    }

    return this.handleResponse<User>(response);
  }

  async refreshAccessToken(): Promise<boolean> {
    // If there's already a refresh in progress, wait for it
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    // No refresh token available
    if (!this.refreshToken) {
      return false;
    }

    // Create a new refresh promise
    this.refreshPromise = (async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            refresh_token: this.refreshToken,
          }),
        });

        const result = await this.handleResponse<AuthTokens>(response);

        if (result.data?.access_token) {
          this.accessToken = result.data.access_token;
          localStorage.setItem("auth_access_token", this.accessToken);
          return true;
        }

        // If refresh failed, clear tokens
        this.accessToken = null;
        this.refreshToken = null;
        localStorage.removeItem("auth_access_token");
        localStorage.removeItem("auth_refresh_token");
        return false;
      } catch (error) {
        console.error("Error refreshing token:", error);
        return false;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  async logout(fromAllDevices: boolean = false): Promise<void> {
    if (this.refreshToken) {
      try {
        const endpoint = fromAllDevices ? "logout-all" : "logout";
        await fetch(`${API_BASE_URL}/api/v1/auth/${endpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            refresh_token: this.refreshToken,
          }),
        });
      } catch (error) {
        console.error("Error during logout:", error);
      }
    }

    // Clear tokens regardless of API call success
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem("auth_access_token");
    localStorage.removeItem("auth_refresh_token");
  }
  getToken(): string | null {
    return this.accessToken;
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  async forgotPassword(email: string): Promise<ApiResponse<any>> {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/auth/forgot-password`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
        }),
      }
    );

    return this.handleResponse(response);
  }

  async resetPassword(
    token: string,
    newPassword: string
  ): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        new_password: newPassword,
      }),
    });

    return this.handleResponse(response);
  }
}

export const authService = new AuthService();
