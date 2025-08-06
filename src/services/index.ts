import { adminService } from "./admin";
import { authService } from "./auth";
import { contactService } from "./contact";
import { ordersService } from "./orders";
import { premiumCodesService } from "./premiumCodes";
import { productsService } from "./products";
import { quizService } from "./quiz";
import { settingsService } from "./settings";

export type {
  ApiResponse,
  CreateQuestionRequest,
  CreateTopicRequest,
  DailyLeaderboardEntry,
  DailyLeaderboardResponse,
  DifficultyLevel,
  Order,
  PaginatedResponse,
  PaginationMetadata,
  Product,
  Question,
  QuestionOption,
  QuestionType,
  QuizSession,
  QuizSessionAnswer,
  QuizSessionAnswerRequest,
  QuizSessionAnswerResponse,
  QuizSessionCompleteResponse,
  QuizSessionStartRequest,
  QuizSessionStatus,
  QuizStats,
  QuizSubmissionResponse,
  // Quiz Game Types
  ReactionQuestion,
  Topic,
  TopicStats,
  User,
} from "./types";

// Export individual services
export {
  adminService,
  authService,
  ordersService,
  premiumCodesService,
  productsService,
  quizService,
  settingsService,
};

// Backward compatibility - export the original apiService structure
export const apiService = {
  // Auth methods
  login: authService.login.bind(authService),
  register: authService.register.bind(authService),
  getCurrentUser: authService.getCurrentUser.bind(authService),
  logout: authService.logout.bind(authService),

  // Product methods
  getProducts: productsService.getProducts.bind(productsService),
  createProduct: productsService.createProduct.bind(productsService),
  updateProduct: productsService.updateProduct.bind(productsService),
  deleteProduct: productsService.deleteProduct.bind(productsService),
  // Order methods
  getOrders: ordersService.getOrders.bind(ordersService),
  getUserOrders: ordersService.getUserOrders.bind(ordersService),
  createOrder: ordersService.createOrder.bind(ordersService),
  updateOrderStatus: ordersService.updateOrderStatus.bind(ordersService),

  // Contact methods
  sendContactMessage: contactService.sendMessage.bind(contactService),

  // Admin methods
  getDashboardStats: adminService.getDashboardStats.bind(adminService),
  getRecentOrders: adminService.getRecentOrders.bind(adminService),
  getAllUsers: adminService.getAllUsers.bind(adminService),
};
