import apiClient from './api.service';
import { User, Subscription } from '../types/auth.types';

interface UpdateProfileData {
  full_name?: string;
  email?: string;
  current_password?: string;
  new_password?: string;
}

// Define the response structure for getUserDetails
interface UserDetailsResponse {
  user: User;
  subscription: Subscription | null;
  credits: number;
}

class UserService {

  // Function to get detailed user info including subscription and credits
  async getUserDetails(userId: string): Promise<UserDetailsResponse> {
    try {
      const response = await apiClient.get<UserDetailsResponse>(`/users/${userId}`); // Endpoint is /api/users/{userId}
      return response.data;
    } catch (error) {
      console.error('Error getting user details:', error);
      throw error;
    }
  }

  async updateProfile(userId: string, data: UpdateProfileData): Promise<User> {
    try {
      const response = await apiClient.put(`/users/${userId}`, data); // Endpoint is /api/users/{userId}
      return response.data.user; // Assuming backend returns { user: ... }
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  async updatePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      await apiClient.put(`/users/${userId}/password`, { // Endpoint is /api/users/{userId}/password
        current_password: currentPassword,
        new_password: newPassword,
      });
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  }

  // Removed toggleEmailNotifications as it wasn't fully implemented
}

export default new UserService(); 