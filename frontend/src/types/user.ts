export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'user' | 'admin';
  created_at: string;
  is_active: boolean;
  subscription?: {
    plan: string;
    status: 'active' | 'inactive' | 'expired' | 'cancelled';
  };
}
