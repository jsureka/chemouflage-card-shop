import { authService } from "./auth";
import type {
  ApiResponse,
  CreateQuestionRequest,
  CreateTopicRequest,
  DailyLeaderboardResponse,
  PaginatedResponse,
  Question,
  QuizSession,
  QuizSessionAnswerResponse,
  QuizSessionCompleteResponse,
  QuizSessionStatus,
  QuizStats,
  QuizSubmissionResponse,
  ReactionQuestion,
  Topic,
  TopicStats,
} from "./types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export interface QuizQueryParams {
  page?: number;
  limit?: number;
  active_only?: boolean;
  search?: string;
  topic_id?: string;
  difficulty?: string;
  question_type?: string;
}

class QuizService {
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

  private buildQueryString(params: QuizQueryParams): string {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, value.toString());
      }
    });
    return searchParams.toString();
  }

  // Topic methods
  async getTopics(
    params: QuizQueryParams = {}
  ): Promise<ApiResponse<PaginatedResponse<Topic>>> {
    const queryString = this.buildQueryString(params);
    const url = `${API_BASE_URL}/api/v1/quiz/topics/${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await fetch(url, {
      headers: this.setAuthHeader(),
    });

    return this.handleResponse<PaginatedResponse<Topic>>(response);
  }

  async getTopic(id: string): Promise<ApiResponse<Topic>> {
    const response = await fetch(`${API_BASE_URL}/api/v1/quiz/topics/${id}`, {
      headers: this.setAuthHeader(),
    });

    return this.handleResponse<Topic>(response);
  }

  async createTopic(data: CreateTopicRequest): Promise<ApiResponse<Topic>> {
    const response = await fetch(`${API_BASE_URL}/api/v1/quiz/topics/`, {
      method: "POST",
      headers: this.setAuthHeader(),
      body: JSON.stringify(data),
    });

    return this.handleResponse<Topic>(response);
  }

  async updateTopic(
    id: string,
    data: Partial<CreateTopicRequest>
  ): Promise<ApiResponse<Topic>> {
    const response = await fetch(`${API_BASE_URL}/api/v1/quiz/topics/${id}`, {
      method: "PUT",
      headers: this.setAuthHeader(),
      body: JSON.stringify(data),
    });

    return this.handleResponse<Topic>(response);
  }

  async deleteTopic(id: string): Promise<ApiResponse<void>> {
    const response = await fetch(`${API_BASE_URL}/api/v1/quiz/topics/${id}`, {
      method: "DELETE",
      headers: this.setAuthHeader(),
    });

    return this.handleResponse<void>(response);
  }

  // Question methods
  async getQuestions(
    params: QuizQueryParams = {}
  ): Promise<ApiResponse<PaginatedResponse<Question>>> {
    const queryString = this.buildQueryString(params);
    const url = `${API_BASE_URL}/api/v1/quiz/questions/${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await fetch(url, {
      headers: this.setAuthHeader(),
    });

    return this.handleResponse<PaginatedResponse<Question>>(response);
  }

  async getQuestion(id: string): Promise<ApiResponse<Question>> {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/quiz/questions/${id}`,
      {
        headers: this.setAuthHeader(),
      }
    );

    return this.handleResponse<Question>(response);
  }

  async createQuestion(
    data: CreateQuestionRequest
  ): Promise<ApiResponse<Question>> {
    const response = await fetch(`${API_BASE_URL}/api/v1/quiz/questions/`, {
      method: "POST",
      headers: this.setAuthHeader(),
      body: JSON.stringify(data),
    });

    return this.handleResponse<Question>(response);
  }

  async updateQuestion(
    id: string,
    data: Partial<CreateQuestionRequest>
  ): Promise<ApiResponse<Question>> {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/quiz/questions/${id}`,
      {
        method: "PUT",
        headers: this.setAuthHeader(),
        body: JSON.stringify(data),
      }
    );

    return this.handleResponse<Question>(response);
  }

  async deleteQuestion(id: string): Promise<ApiResponse<void>> {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/quiz/questions/${id}`,
      {
        method: "DELETE",
        headers: this.setAuthHeader(),
      }
    );

    return this.handleResponse<void>(response);
  }

  // Statistics methods
  async getQuizStats(): Promise<ApiResponse<QuizStats>> {
    const response = await fetch(`${API_BASE_URL}/api/v1/quiz/stats/`, {
      headers: this.setAuthHeader(),
    });

    return this.handleResponse<QuizStats>(response);
  }

  async getTopicStats(id: string): Promise<ApiResponse<TopicStats>> {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/quiz/stats/topics/${id}`,
      {
        headers: this.setAuthHeader(),
      }
    );

    return this.handleResponse<TopicStats>(response);
  }

  async getAllTopicStats(): Promise<ApiResponse<TopicStats[]>> {
    const response = await fetch(`${API_BASE_URL}/api/v1/quiz/stats/topics`, {
      headers: this.setAuthHeader(),
    });

    return this.handleResponse<TopicStats[]>(response);
  }

  // Quiz Game methods
  async getReactionQuestion(): Promise<ApiResponse<ReactionQuestion>> {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/quiz/reaction-question`,
      {
        headers: this.setAuthHeader(),
      }
    );

    return this.handleResponse<ReactionQuestion>(response);
  }

  async submitQuizAnswer(
    questionId: string,
    selectedOptionId: string
  ): Promise<ApiResponse<QuizSubmissionResponse>> {
    const response = await fetch(`${API_BASE_URL}/api/v1/quiz/submit`, {
      method: "POST",
      headers: this.setAuthHeader(),
      body: JSON.stringify({
        question_id: questionId,
        selected_option_id: selectedOptionId,
      }),
    });

    return this.handleResponse<QuizSubmissionResponse>(response);
  }

  // Quiz Session methods
  async getQuizSessionStatus(): Promise<ApiResponse<QuizSessionStatus>> {
    const response = await fetch(`${API_BASE_URL}/api/v1/quiz/session/status`, {
      headers: this.setAuthHeader(),
    });

    return this.handleResponse<QuizSessionStatus>(response);
  }

  async startQuizSession(
    questionCount: number = 10
  ): Promise<ApiResponse<QuizSession>> {
    const response = await fetch(`${API_BASE_URL}/api/v1/quiz/start-session`, {
      method: "POST",
      headers: this.setAuthHeader(),
      body: JSON.stringify({
        question_count: questionCount,
      }),
    });

    return this.handleResponse<QuizSession>(response);
  }

  async getSessionQuestion(
    sessionId: string
  ): Promise<ApiResponse<ReactionQuestion>> {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/quiz/session/${sessionId}/question`,
      {
        headers: this.setAuthHeader(),
      }
    );

    return this.handleResponse<ReactionQuestion>(response);
  }

  async submitSessionAnswer(
    sessionId: string,
    questionId: string,
    selectedOptionId: string
  ): Promise<ApiResponse<QuizSessionAnswerResponse>> {
    const response = await fetch(`${API_BASE_URL}/api/v1/quiz/session/answer`, {
      method: "POST",
      headers: this.setAuthHeader(),
      body: JSON.stringify({
        session_id: sessionId,
        question_id: questionId,
        selected_option_id: selectedOptionId,
      }),
    });

    return this.handleResponse<QuizSessionAnswerResponse>(response);
  }

  async completeQuizSession(
    sessionId: string
  ): Promise<ApiResponse<QuizSessionCompleteResponse>> {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/quiz/session/${sessionId}/complete`,
      {
        method: "POST",
        headers: this.setAuthHeader(),
      }
    );

    return this.handleResponse<QuizSessionCompleteResponse>(response);
  }

  async getDailyLeaderboard(): Promise<ApiResponse<DailyLeaderboardResponse>> {
    const response = await fetch(`${API_BASE_URL}/api/v1/scoreboard/daily`, {
      headers: this.setAuthHeader(),
    });

    return this.handleResponse<DailyLeaderboardResponse>(response);
  }
}

export const quizService = new QuizService();
