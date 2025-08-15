import { authService } from "./auth";
import { ApiResponse, PaginatedResponse, Product } from "./types";

const API_BASE_URL = import.meta.env.VITE_API_URL as string;

class ProductsService {
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
  async getProducts(params?: {
    page?: number;
    limit?: number;
    active_only?: boolean;
    category?: string;
  }): Promise<ApiResponse<PaginatedResponse<Product>>> {
    const queryParams = new URLSearchParams();

    if (params?.page !== undefined) {
      queryParams.append("page", params.page.toString());
    }
    if (params?.limit !== undefined) {
      queryParams.append("limit", params.limit.toString());
    }
    if (params?.active_only !== undefined) {
      queryParams.append("active_only", params.active_only.toString());
    }
    if (params?.category) {
      queryParams.append("category", params.category);
    }

    const url = `${API_BASE_URL}/api/v1/products/${
      queryParams.toString() ? "?" + queryParams.toString() : ""
    }`;

    const response = await fetch(url, {
      method: "GET",
      headers: this.setAuthHeader(),
    });

    return this.handleResponse<PaginatedResponse<Product>>(response);
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

  async searchProducts(query: string): Promise<ApiResponse<Product[]>> {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/products/search/${encodeURIComponent(query)}`,
      {
        headers: this.setAuthHeader(),
      }
    );

    return this.handleResponse<Product[]>(response);
  }

  async getProductById(id: string): Promise<ApiResponse<Product>> {
    const response = await fetch(`${API_BASE_URL}/api/v1/products/${id}`, {
      headers: this.setAuthHeader(),
    });

    return this.handleResponse<Product>(response);
  }

  async uploadProductImage(
    file: File
  ): Promise<ApiResponse<{ image_url: string }>> {
    const formData = new FormData();
    formData.append("file", file);
    // Use setAuthHeader, but remove Content-Type for FormData
    const headers = { ...this.setAuthHeader() };
    if (headers["Content-Type"]) {
      delete headers["Content-Type"];
    }
    const response = await fetch(
      `${API_BASE_URL}/api/v1/products/upload-image`,
      {
        method: "POST",
        headers,
        body: formData,
      }
    );
    try {
      const data = await response.json();
      if (!response.ok) {
        return {
          error: data.detail || data.message || "Failed to upload image",
        };
      }
      return { data };
    } catch (error) {
      return { error: "Failed to process response" };
    }
  }
}

export const productsService = new ProductsService();
