export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
}

export interface Order {
  id: string;
  plan: string;
  status: string;
  start_date: string;
  end_date: string | null;
  created_at: string;
  is_active: boolean;
  user: User;
}

export interface PaymentOrder {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  amount: number;
  status: string;
  currency: string;
  payment_method: string;
  transaction_id: string;
  created_at: string;
  updated_at: string;
  paid_at?: string;
  subscription_plan?: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface PackageStat {
  plan: string;
  count: number;
  is_paid: boolean;
}

export interface DashboardStats {
  total_users: number;
  new_users_this_month: number;
  total_revenue: number;
  summary: {
    active_subscriptions: number;
    failed_orders: number;
    churn_rate?: number;
    new_users_this_month: number;
    pending_orders: number;
    successful_orders: number;
    total_orders: number;
    total_revenue: number;
    total_users: number;
  };
  charts: {
    monthly_revenue: Array<{
      month: string;
      total: number;
    }>;
    order_status: Array<{
      status: string;
      count: number;
      total: number;
    }>;
    subscription_distribution: Array<{
      plan: string;
      count: number;
      is_paid: boolean;
    }>;
    user_growth: Array<{
      month: string;
      count: number;
    }>;
  };
  package_stats: Array<{
    plan: string;
    count: number;
    is_paid: boolean;
  }>;
  recent_activities: Array<{
    type: string;
    user_id: string;
    user_email: string;
    user_name: string;
    created_at: string;
    amount?: number;
  }>;
  monthly_revenue: Array<{
    month: string;
    revenue: number;
  }>;
  payment_methods: Array<{
    method: string;
    count: number;
    percentage: number;
  }>;
  recent_transactions: Order[];
  recent_users: User[];
  user_growth: Array<{
    date: string;
    count: number;
  }>;
}

export interface OrderStats {
  total_orders: number;
  pending_orders: number;
  completed_orders: number;
  cancelled_orders: number;
  total_revenue: number;
  monthly_revenue: Array<{
    month: string;
    revenue: number;
  }>;
  payment_method_distribution: Array<{
    method: string;
    count: number;
    percentage: number;
  }>;
  recent_orders: Order[];
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface ExportParams {
  status?: string;
  start_date?: string;
  end_date?: string;
}

export interface SubscriptionStats {
  total_subscriptions: number;
  by_plan: Array<{
    plan: string;
    count: number;
  }>;
  active_subscriptions: number;
  expired_subscriptions: number;
  subscription_status: {
    active: number;
    expired: number;
  };
}
