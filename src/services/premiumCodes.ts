import { authService } from "./auth";
import { ApiResponse, PaginatedResponse } from "./types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export interface PremiumCode {
  id: string;
  code: string;
  description?: string;
  is_active: boolean;
  usage_limit?: number;
  used_count: number;
  expires_at?: string;
  created_at: string;
  updated_at?: string;
  bound_user_id?: string;
  bound_user_email?: string;
  distributed_to_order_id?: string;
  distributed_to_email?: string;
  distributed_at?: string;
}

export interface PremiumCodeCreate {
  description?: string;
  is_active?: boolean;
  usage_limit?: number;
  expires_at?: string;
}

export interface PremiumCodeUpdate {
  description?: string;
  is_active?: boolean;
  usage_limit?: number;
  expires_at?: string;
}

export interface PremiumCodeGenerate {
  count: number;
  description?: string;
  usage_limit?: number;
  expires_at?: string;
}

export interface PremiumCodeBind {
  user_email: string;
}

export interface PremiumCodeStats {
  total_codes: number;
  active_codes: number;
  bound_codes: number;
  unbound_codes: number;
}

class PremiumCodesService {
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

  async createPremiumCode(
    premiumCode: PremiumCodeCreate
  ): Promise<ApiResponse<{ message: string; code: PremiumCode }>> {
    const response = await fetch(`${API_BASE_URL}/api/v1/premium-codes/`, {
      method: "POST",
      headers: this.setAuthHeader(),
      body: JSON.stringify(premiumCode),
    });

    return this.handleResponse<{ message: string; code: PremiumCode }>(
      response
    );
  }

  async generatePremiumCodes(
    generateRequest: PremiumCodeGenerate
  ): Promise<ApiResponse<{ message: string; codes: PremiumCode[] }>> {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/premium-codes/generate`,
      {
        method: "POST",
        headers: this.setAuthHeader(),
        body: JSON.stringify(generateRequest),
      }
    );

    return this.handleResponse<{ message: string; codes: PremiumCode[] }>(
      response
    );
  }
  async getPremiumCodes(
    page: number = 1,
    limit: number = 100,
    active_only?: boolean,
    bound_only?: boolean
  ): Promise<ApiResponse<PaginatedResponse<PremiumCode>>> {
    const queryParams = new URLSearchParams();
    queryParams.append("page", page.toString());
    queryParams.append("limit", limit.toString());

    if (active_only !== undefined) {
      queryParams.append("active_only", active_only.toString());
    }
    if (bound_only !== undefined) {
      queryParams.append("bound_only", bound_only.toString());
    }

    const response = await fetch(
      `${API_BASE_URL}/api/v1/premium-codes/?${queryParams.toString()}`,
      {
        headers: this.setAuthHeader(),
      }
    );

    return this.handleResponse<PaginatedResponse<PremiumCode>>(response);
  }

  async getPremiumCodeStats(): Promise<ApiResponse<PremiumCodeStats>> {
    const response = await fetch(`${API_BASE_URL}/api/v1/premium-codes/stats`, {
      headers: this.setAuthHeader(),
    });

    return this.handleResponse<PremiumCodeStats>(response);
  }

  async getMyPremiumCodes(): Promise<ApiResponse<PremiumCode[]>> {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/premium-codes/my-codes`,
      {
        headers: this.setAuthHeader(),
      }
    );

    return this.handleResponse<PremiumCode[]>(response);
  }

  async getPremiumCodeById(codeId: string): Promise<ApiResponse<PremiumCode>> {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/premium-codes/${codeId}`,
      {
        headers: this.setAuthHeader(),
      }
    );

    return this.handleResponse<PremiumCode>(response);
  }

  async bindPremiumCode(
    codeId: string,
    bindRequest: PremiumCodeBind
  ): Promise<ApiResponse<PremiumCode>> {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/premium-codes/${codeId}/bind`,
      {
        method: "POST",
        headers: this.setAuthHeader(),
        body: JSON.stringify(bindRequest),
      }
    );

    return this.handleResponse<PremiumCode>(response);
  }

  async unbindPremiumCode(codeId: string): Promise<ApiResponse<PremiumCode>> {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/premium-codes/${codeId}/unbind`,
      {
        method: "POST",
        headers: this.setAuthHeader(),
      }
    );

    return this.handleResponse<PremiumCode>(response);
  }

  async updatePremiumCode(
    codeId: string,
    codeUpdate: PremiumCodeUpdate
  ): Promise<ApiResponse<PremiumCode>> {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/premium-codes/${codeId}`,
      {
        method: "PUT",
        headers: this.setAuthHeader(),
        body: JSON.stringify(codeUpdate),
      }
    );

    return this.handleResponse<PremiumCode>(response);
  }

  async deletePremiumCode(
    codeId: string
  ): Promise<ApiResponse<{ message: string }>> {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/premium-codes/${codeId}`,
      {
        method: "DELETE",
        headers: this.setAuthHeader(),
      }
    );

    return this.handleResponse<{ message: string }>(response);
  }

  async usePremiumCode(
    code: string
  ): Promise<ApiResponse<{ message: string }>> {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/premium-codes/use/${code}`,
      {
        method: "POST",
        headers: this.setAuthHeader(),
      }
    );

    return this.handleResponse<{ message: string }>(response);
  }

  async validatePremiumCode(
    code: string
  ): Promise<
    ApiResponse<{ valid: boolean; reason?: string; code?: PremiumCode }>
  > {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/premium-codes/validate/${code}`,
      {
        headers: this.setAuthHeader(),
      }
    );

    return this.handleResponse<{
      valid: boolean;
      reason?: string;
      code?: PremiumCode;
    }>(response);
  }
}

export const premiumCodesService = new PremiumCodesService();
