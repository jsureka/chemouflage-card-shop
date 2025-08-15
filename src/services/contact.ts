import { ApiResponse } from "./types";

const API_BASE_URL = import.meta.env.VITE_API_URL as string;

export interface ContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactMessageResponse {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
  admin_response?: string;
  admin_response_at?: string;
}

class ContactService {
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    try {
      if (response.status === 204) {
        return { data: undefined as T };
      }

      const data = await response.json();

      if (!response.ok) {
        return {
          data: undefined as T,
          error: data.detail || "An error occurred",
        };
      }

      return { data };
    } catch (error) {
      return {
        data: undefined as T,
        error: "Network error occurred",
      };
    }
  }

  async sendMessage(
    messageData: ContactMessage
  ): Promise<ApiResponse<ContactMessageResponse>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/contact/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messageData),
      });

      return await this.handleResponse<ContactMessageResponse>(response);
    } catch (error) {
      return {
        data: undefined as ContactMessageResponse,
        error:
          "Failed to send message. Please check your connection and try again.",
      };
    }
  }
}

export const contactService = new ContactService();
