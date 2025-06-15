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
