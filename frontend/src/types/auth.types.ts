export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'user' | 'admin';
  subscription?: Subscription;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  full_name: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface VNPayPaymentData {
  price: number;
  return_url: string;
  ipAddr?: string;
}

export interface VNPayResponse {
  paymentUrl: string;
}

export interface Subscription {
  plan: 'free' | 'student' | 'pro' | 'unlimited';
  status: 'active' | 'expired' | 'cancelled';
  start_date: string;
  end_date: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
} 