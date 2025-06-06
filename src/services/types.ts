export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
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
  status: string;
  payment_status: string;
  delivery_status: string;
  payment_method: string;
  shipping_address: any;
  premium_code_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}
