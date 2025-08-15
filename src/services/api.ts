const API_BASE_URL = import.meta.env.VITE_API_URL as string;

interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: "customer" | "admin";
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price: number;
  discount_percentage: number;
  image_url: string | null;
  category: string;
  stock_quantity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: string;
  payment_method: string;
  shipping_address: any;
  created_at: string;
  updated_at: string;
}

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiService {
  private token: string | null = null;

  constructor() {
    // Load token from localStorage on initialization
    this.token = localStorage.getItem("auth_access_token");
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

  // Auth methods
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
      localStorage.setItem("auth_access_token", this.token);
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
    localStorage.removeItem("auth_access_token");
    localStorage.removeItem("auth_refresh_token");
  }

  // Product methods
  async getProducts(): Promise<ApiResponse<Product[]>> {
    const response = await fetch(`${API_BASE_URL}/api/v1/products/`, {
      headers: this.setAuthHeader(),
    });

    return this.handleResponse<Product[]>(response);
  }

  async createProduct(
    product: Omit<Product, "id" | "created_at" | "updated_at">
  ): Promise<ApiResponse<Product>> {
    const response = await fetch(`${API_BASE_URL}/api/v1/products/`, {
      method: "POST",
      headers: this.setAuthHeader(),
      body: JSON.stringify(product),
    });

    return this.handleResponse<Product>(response);
  }

  async updateProduct(
    id: string,
    updates: Partial<Product>
  ): Promise<ApiResponse<Product>> {
    const response = await fetch(`${API_BASE_URL}/api/v1/products/${id}`, {
      method: "PUT",
      headers: this.setAuthHeader(),
      body: JSON.stringify(updates),
    });

    return this.handleResponse<Product>(response);
  }

  async deleteProduct(id: string): Promise<ApiResponse<void>> {
    const response = await fetch(`${API_BASE_URL}/api/v1/products/${id}`, {
      method: "DELETE",
      headers: this.setAuthHeader(),
    });

    return this.handleResponse<void>(response);
  }

  // Order methods
  async getOrders(): Promise<ApiResponse<Order[]>> {
    const response = await fetch(`${API_BASE_URL}/api/v1/orders/`, {
      headers: this.setAuthHeader(),
    });

    return this.handleResponse<Order[]>(response);
  }

  async getUserOrders(): Promise<ApiResponse<Order[]>> {
    const response = await fetch(`${API_BASE_URL}/api/v1/orders/user`, {
      headers: this.setAuthHeader(),
    });

    return this.handleResponse<Order[]>(response);
  }

  async createOrder(orderData: {
    total_amount: number;
    payment_method: string;
    shipping_address: any;
    items: Array<{ product_id: string; quantity: number; price: number }>;
  }): Promise<ApiResponse<Order>> {
    const response = await fetch(`${API_BASE_URL}/api/v1/orders/`, {
      method: "POST",
      headers: this.setAuthHeader(),
      body: JSON.stringify(orderData),
    });

    return this.handleResponse<Order>(response);
  }

  async updateOrderStatus(
    id: string,
    status: string
  ): Promise<ApiResponse<Order>> {
    const response = await fetch(`${API_BASE_URL}/api/v1/orders/${id}/status`, {
      method: "PATCH",
      headers: this.setAuthHeader(),
      body: JSON.stringify({ status }),
    });

    return this.handleResponse<Order>(response);
  }
  // Admin dashboard methods
  async getDashboardStats(): Promise<
    ApiResponse<{
      totalProducts: number;
      totalOrders: number;
      totalRevenue: number;
      totalCustomers: number;
    }>
  > {
    const response = await fetch(`${API_BASE_URL}/api/v1/dashboard/stats`, {
      headers: this.setAuthHeader(),
    });

    return this.handleResponse<{
      totalProducts: number;
      totalOrders: number;
      totalRevenue: number;
      totalCustomers: number;
    }>(response);
  }
  async getRecentOrders(limit: number = 10): Promise<ApiResponse<Order[]>> {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/orders?limit=${limit}`,
      {
        headers: this.setAuthHeader(),
      }
    );

    return this.handleResponse<Order[]>(response);
  }

  async getAllUsers(): Promise<ApiResponse<User[]>> {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/users`, {
      headers: this.setAuthHeader(),
    });

    return this.handleResponse<User[]>(response);
  }
}

export const apiService = new ApiService();
export type { ApiResponse, Order, Product, User };
