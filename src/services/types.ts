export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  firebase_uid?: string;
  email_verified?: boolean;
  role: "customer" | "admin";
}

export interface Product {
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

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  delivery_charge: number;
  status: string;
  payment_status: string;
  delivery_status: string;
  payment_method: string;
  shipping_address: any;
  premium_code_id?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

export interface OrderCreationResponse {
  order: Order;
  payment_required: boolean;
  payment_url?: string;
  transaction_id?: string;
  payment_error?: string;
  message: string;
}

export interface PaginationMetadata {
  current_page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMetadata;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// Quiz types
export interface QuestionOption {
  id: string;
  title: string;
  image_url?: string;
  is_correct: boolean;
}

export type DifficultyLevel = "easy" | "medium" | "hard";
export type QuestionType = "descriptive" | "short_answer" | "multiple_choice";

export interface Topic {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  question_count: number;
}

export interface Question {
  id: string;
  topic_id: string;
  title: string;
  image_url?: string;
  difficulty: DifficultyLevel;
  question_type: QuestionType;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  options?: QuestionOption[];
  topic_name?: string;
}

export interface CreateTopicRequest {
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface CreateQuestionRequest {
  topic_id: string;
  title: string;
  image_url?: string;
  difficulty: DifficultyLevel;
  question_type: QuestionType;
  options?: Omit<QuestionOption, "id">[];
}

export interface QuizStats {
  total_topics: number;
  total_questions: number;
  active_topics: number;
  active_questions: number;
  questions_by_difficulty: {
    easy: number;
    medium: number;
    hard: number;
  };
  questions_by_type: {
    multiple_choice: number;
    short_answer: number;
    descriptive: number;
  };
}

export interface TopicStats {
  topic: Topic;
  total_questions: number;
  questions_by_difficulty: {
    easy: number;
    medium: number;
    hard: number;
  };
  questions_by_type: {
    multiple_choice: number;
    short_answer: number;
    descriptive: number;
  };
}

// Quiz Game Types
export interface ReactionQuestion {
  id: string;
  topic_id: string;
  title: string;
  image_url?: string;
  difficulty: string;
  question_type: string;
  options: QuestionOption[];
  topic_name?: string;
  // Session-specific fields
  question_number?: number;
  total_questions?: number;
  session_id?: string;
}

export interface QuizSubmissionResponse {
  is_correct: boolean;
  correct_option_id: string;
  explanation?: string;
  score: number;
  streak: number;
  daily_score: number;
  daily_streak: number;
}

// Quiz Session Types
export interface QuizSession {
  id: string;
  user_id: string;
  question_ids: string[];
  current_question_index: number;
  status: "active" | "completed";
  started_at: string;
  completed_at?: string;
  total_time_seconds?: number;
  answers: QuizSessionAnswer[];
}

export interface QuizSessionAnswer {
  question_id: string;
  selected_option_id: string;
  is_correct: boolean;
  answered_at: string;
}

export interface QuizSessionStartRequest {
  question_count: number;
}

export interface QuizSessionAnswerRequest {
  session_id: string;
  question_id: string;
  selected_option_id: string;
}

export interface QuizSessionAnswerResponse {
  is_correct: boolean;
  correct_option_id: string;
  question_completed: boolean;
  session_complete: boolean;
  next_question_number?: number;
  total_questions: number;
}

export interface QuizSessionCompleteResponse {
  session_id: string;
  total_questions: number;
  correct_answers: number;
  total_time_seconds: number;
  score_earned: number;
  streak_achieved: number;
  daily_score: number;
  daily_streak: number;
}

export interface QuizSessionStatus {
  has_completed_today: boolean;
  has_active_session: boolean;
  active_session_id?: string;
  current_question_index?: number;
  total_questions?: number;
}

export interface DailyLeaderboardEntry {
  user_name: string;
  daily_score: number;
  daily_streak: number;
  questions_answered: number;
  correct_answers: number;
  accuracy_percentage: number;
}

export interface DailyLeaderboardResponse {
  date: string;
  leaderboard: DailyLeaderboardEntry[];
}
