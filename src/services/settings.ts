import { authService } from "./auth";
import { ApiResponse } from "./types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

interface PaymentMethodSettings {
  name: string;
  is_enabled: boolean;
  display_name: string;
  description?: string;
  icon?: string;
}

interface PaymentSettings {
  id: string;
  aamarpay: PaymentMethodSettings;
  cash_on_delivery: PaymentMethodSettings;
  created_at: string;
  updated_at?: string;
}

interface EnabledPaymentMethods {
  methods: PaymentMethodSettings[];
}

interface PaymentSettingsUpdate {
  aamarpay?: PaymentMethodSettings;
  cash_on_delivery?: PaymentMethodSettings;
}

class SettingsService {
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

  async getEnabledPaymentMethods(): Promise<
    ApiResponse<EnabledPaymentMethods>
  > {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/settings/payment-methods`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return this.handleResponse<EnabledPaymentMethods>(response);
  }

  async getPaymentSettings(): Promise<ApiResponse<PaymentSettings>> {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/settings/payment-settings`,
      {
        method: "GET",
        headers: this.setAuthHeader(),
      }
    );

    return this.handleResponse<PaymentSettings>(response);
  }

  async updatePaymentSettings(
    settingsUpdate: PaymentSettingsUpdate
  ): Promise<ApiResponse<PaymentSettings>> {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/settings/payment-settings`,
      {
        method: "PUT",
        headers: this.setAuthHeader(),
        body: JSON.stringify(settingsUpdate),
      }
    );

    return this.handleResponse<PaymentSettings>(response);
  }

  async togglePaymentMethod(
    methodName: string,
    enabled: boolean
  ): Promise<ApiResponse<{ message: string }>> {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/settings/payment-methods/${methodName}/toggle?enabled=${enabled}`,
      {
        method: "POST",
        headers: this.setAuthHeader(),
      }
    );

    return this.handleResponse<{ message: string }>(response);
  }
}

export const settingsService = new SettingsService();
export type {
  PaymentMethodSettings,
  PaymentSettings,
  EnabledPaymentMethods,
  PaymentSettingsUpdate,
};
