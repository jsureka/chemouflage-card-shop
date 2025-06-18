import { authService } from "./auth";
import { ApiResponse, Order, PaginatedResponse, User } from "./types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

class AdminService {
  private setAuthHeader(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    const token = authService.getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
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
  async getRecentOrders(
    limit: number = 10
  ): Promise<ApiResponse<PaginatedResponse<Order>>> {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/orders?limit=${limit}`,
      {
        headers: this.setAuthHeader(),
      }
    );

    return this.handleResponse<PaginatedResponse<Order>>(response);
  }
  async getAllUsers(
    page: number = 1,
    limit: number = 100
  ): Promise<ApiResponse<PaginatedResponse<User>>> {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/auth/users?page=${page}&limit=${limit}`,
      {
        headers: this.setAuthHeader(),
      }
    );

    return this.handleResponse<PaginatedResponse<User>>(response);
  }
  async getAllOrders(
    page: number = 1,
    limit: number = 100,
    filters?: {
      status?: string;
      payment_status?: string;
      search?: string;
      date_from?: string;
      date_to?: string;
    }
  ): Promise<ApiResponse<PaginatedResponse<Order>>> {
    const queryParams = new URLSearchParams();
    queryParams.append("page", page.toString());
    queryParams.append("limit", limit.toString());

    if (filters) {
      if (filters.status) queryParams.append("status", filters.status);
      if (filters.payment_status)
        queryParams.append("payment_status", filters.payment_status);
      if (filters.search) queryParams.append("search", filters.search);
      if (filters.date_from) queryParams.append("date_from", filters.date_from);
      if (filters.date_to) queryParams.append("date_to", filters.date_to);
    }

    const response = await fetch(
      `${API_BASE_URL}/api/v1/orders/?${queryParams.toString()}`,
      {
        headers: this.setAuthHeader(),
      }
    );

    return this.handleResponse<PaginatedResponse<Order>>(response);
  }
  async updateOrderStatus(
    orderId: string,
    updates: {
      status?: string;
      payment_status?: string;
      payment_method?: string;
      total_amount?: number;
      delivery_charge?: number;
    }
  ): Promise<ApiResponse<Order>> {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/orders/admin/${orderId}`,
      {
        method: "PUT",
        headers: this.setAuthHeader(),
        body: JSON.stringify(updates),
      }
    );

    return this.handleResponse<Order>(response);
  }

  async getOrderDetails(orderId: string): Promise<ApiResponse<any>> {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/orders/admin/${orderId}/details`,
      {
        headers: this.setAuthHeader(),
      }
    );

    return this.handleResponse<any>(response);
  }
}

export const adminService = new AdminService();
