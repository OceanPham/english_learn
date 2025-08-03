export const API_BASE_URL = 'http://localhost:5000/api';

export const API_ENDPOINTS = {
    CHAT: {
        SEND_MESSAGE: '/chat/gpt',
        GET_HISTORY: '/chat/history'
    },
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        LOGOUT: '/auth/logout'
    },
    USER: {
        PROFILE: '/user/profile',
        UPDATE: '/user/update'
    }
}; 