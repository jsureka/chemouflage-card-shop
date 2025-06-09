import { adminService } from "./admin";
import { authService } from "./auth";
import { ordersService } from "./orders";
import { premiumCodesService } from "./premiumCodes";
import { productsService } from "./products";
import { settingsService } from "./settings";

export type {
  ApiResponse,
  Order,
  PaginatedResponse,
  PaginationMetadata,
  Product,
  User,
} from "./types";

// Export individual services
export {
  adminService,
  authService,
  ordersService,
  premiumCodesService,
  productsService,
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

  // Admin methods
  getDashboardStats: adminService.getDashboardStats.bind(adminService),
  getRecentOrders: adminService.getRecentOrders.bind(adminService),
  getAllUsers: adminService.getAllUsers.bind(adminService),
};
