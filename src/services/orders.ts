import { authService } from "./auth";
import { ApiResponse, Order } from "./types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

class OrdersService {
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

  async getOrders(): Promise<ApiResponse<Order[]>> {
    const response = await fetch(`${API_BASE_URL}/api/v1/orders/`, {
      headers: this.setAuthHeader(),
    });

    return this.handleResponse<Order[]>(response);
  }
  async getUserOrders(): Promise<ApiResponse<Order[]>> {
    const response = await fetch(`${API_BASE_URL}/api/v1/orders/my-orders`, {
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
    // Get current user
    const userResponse = await authService.getCurrentUser();
    if (userResponse.error || !userResponse.data) {
      return { error: "User not authenticated" };
    } // Prepare order data according to backend OrderCreate model
    const backendOrderData = {
      user_id: userResponse.data.id,
      total_amount: orderData.total_amount,
      payment_method: orderData.payment_method,
      shipping_address: {
        firstName: orderData.shipping_address.firstName,
        lastName: orderData.shipping_address.lastName,
        address: orderData.shipping_address.address,
        city: orderData.shipping_address.city,
        area: orderData.shipping_address.area,
        zipCode: orderData.shipping_address.zipCode,
        phone: orderData.shipping_address.phone,
      },
    };

    const response = await fetch(`${API_BASE_URL}/api/v1/orders/`, {
      method: "POST",
      headers: this.setAuthHeader(),
      body: JSON.stringify(backendOrderData),
    });

    const result = await this.handleResponse<Order>(response);

    // If order creation was successful, create order items
    if (result.data && orderData.items && orderData.items.length > 0) {
      try {
        for (const item of orderData.items) {
          await this.createOrderItem({
            order_id: result.data.id,
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price,
          });
        }
      } catch (error) {
        console.error("Error creating order items:", error);
        // Order was created but items failed - you might want to handle this differently
      }
    }

    return result;
  }

  async createOrderItem(itemData: {
    order_id: string;
    product_id: string;
    quantity: number;
    price: number;
  }): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_BASE_URL}/api/v1/orders/items`, {
      method: "POST",
      headers: this.setAuthHeader(),
      body: JSON.stringify(itemData),
    });

    return this.handleResponse<any>(response);
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

  async trackOrder(orderId: string): Promise<ApiResponse<Order>> {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/orders/track/${orderId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return this.handleResponse<Order>(response);
  }
}

export const ordersService = new OrdersService();
