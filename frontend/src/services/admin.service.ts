import axios from 'axios';
import AuthService from './auth.service';
import {
  User,
  Order,
  DashboardStats,
  OrderStats,
  PaginatedResponse,
  ExportParams,
} from '../types/admin.types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const adminApi = axios.create({
  baseURL: `${API_URL}/admin`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
adminApi.interceptors.request.use(
  (config) => {
    const token = AuthService.getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// User Management
export const getUsers = async (params: {
  page?: number;
  per_page?: number;
  search?: string;
}): Promise<PaginatedResponse<User>> => {
  const response = await adminApi.get('/users', { params });
  return response.data;
};

export const getUser = async (userId: string): Promise<{ user: User }> => {
  const response = await adminApi.get(`/users/${userId}`);
  return response.data;
};

export const updateUser = async (
  userId: string,
  userData: Partial<User>
): Promise<{ user: User }> => {
  const response = await adminApi.put(`/users/${userId}`, userData);
  return response.data;
};

export const deleteUser = async (userId: string) => {
  const response = await adminApi.delete(`/users/${userId}`);
  return response.data;
};

// Order Management
export const getOrders = async (params: {
  page?: number;
  per_page?: number;
  status?: string;
  search?: string;
  start_date?: string;
  end_date?: string;
}): Promise<PaginatedResponse<Order>> => {
  const response = await adminApi.get('/orders', { params });
  
  // Handle different response structures
  if (response.data.orders !== undefined) {
    // Response has { orders: [], current_page, pages, per_page, total }
    return {
      items: response.data.orders,
      total: response.data.total || 0,
      page: response.data.current_page || 1,
      per_page: response.data.per_page || 10,
      total_pages: response.data.pages || 1,
    };
  }
  
  // Default to assuming the response is already in PaginatedResponse format
  return response.data;
};

export const getOrderStats = async (): Promise<OrderStats> => {
  const response = await adminApi.get('/orders/stats');
  return response.data;
};

// Export
export const exportOrders = async (params: ExportParams): Promise<Blob> => {
  const response = await adminApi.get('/export/orders', {
    params,
    responseType: 'blob',
  });
  return response.data;
};

export const exportUsers = async (): Promise<Blob> => {
  const response = await adminApi.get('/export/users', {
    responseType: 'blob',
  });
  return response.data;
};

// Statistics
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await adminApi.get('/stats/dashboard');
  return response.data;
};

export const getMonthlyRevenue = async (): Promise<Array<{ month: string; revenue: number }>> => {
  const response = await adminApi.get('/stats/monthly-revenue');
  return response.data;
};

export const getUserGrowth = async (): Promise<Array<{ month: string; count: number }>> => {
  const response = await adminApi.get('/stats/user-growth');
  return response.data;
};

export const getSubscriptionStats = async (): Promise<{
  total: number;
  active: number;
  cancelled: number;
  plans: Array<{ name: string; count: number }>;
}> => {
  const response = await adminApi.get('/stats/subscription');
  return response.data;
};

export default {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getOrders,
  getDashboardStats,
};
