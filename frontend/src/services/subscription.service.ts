import apiClient from './api.service';

interface SubscriptionResponse {
    subscription: {
        plan: string;
        status: string;
        start_date: string;
        end_date: string;
    };
    credits: number;
    message: string;
}

class SubscriptionService {
    async createSubscription(plan: string): Promise<SubscriptionResponse> {
        const response = await apiClient.post<SubscriptionResponse>(
            '/subscription',
            { plan }
        );
        return response.data;
    }

    async getCurrentSubscription(): Promise<SubscriptionResponse> {
        const response = await apiClient.get<SubscriptionResponse>(
            '/subscription'
        );
        return response.data;
    }
}

export default new SubscriptionService(); 