import apiClient from './api.service';
import { API_ENDPOINTS } from '../config/api.config';

export interface ChatMessage {
    id: string;
    user_id: string;
    message: string;
    role: 'user' | 'assistant';
    created_at: string;
}

export interface ChatResponse {
    user_message: ChatMessage;
    ai_response: ChatMessage;
}

class ChatService {
    async sendMessage(userId: string, message: string): Promise<ChatResponse> {
        const response = await apiClient.post(API_ENDPOINTS.CHAT.SEND_MESSAGE, {
            user_id: userId,
            message
        });
        return response.data;
    }

    async getChatHistory(userId: string): Promise<ChatMessage[]> {
        const response = await apiClient.get(`${API_ENDPOINTS.CHAT.GET_HISTORY}/${userId}`);
        return response.data;
    }
}

export default new ChatService(); 