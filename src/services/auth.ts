import { ApiResponse, User } from "./types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

class AuthService {
  private token: string | null = null;

  constructor() {
    // Load token from localStorage on initialization
    this.token = localStorage.getItem("auth_token");
  }

  private setAuthHeader(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
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
  ): Promise<ApiResponse<{ user: User; access_token: string }>> {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        username: email,
        password: password,
      }),
    });

    const result = await this.handleResponse<{
      user: User;
      access_token: string;
    }>(response);

    if (result.data?.access_token) {
      this.token = result.data.access_token;
      localStorage.setItem("auth_token", this.token);
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
    if (!this.token) {
      return { error: "No authentication token" };
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
      headers: this.setAuthHeader(),
    });

    return this.handleResponse<User>(response);
  }

  logout(): void {
    this.token = null;
    localStorage.removeItem("auth_token");
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}

export const authService = new AuthService();
