import { useState, useEffect, useRef } from 'react';
import chatService, { ChatMessage } from '../../services/chat.service';
import './ChatWidget.css';

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    // Get user ID from localStorage
    const user = localStorage.getItem('user');
    const userId = user ? JSON.parse(user).id : null;

    // If no user ID is found, create and store a temporary one
    useEffect(() => {
        if (!userId) {
            const tempUserId = `temp-${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem('id', tempUserId);
        }
    }, [userId]);

    useEffect(() => {
        if (isOpen && userId) {
            loadChatHistory();
        }
    }, [isOpen, userId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const loadChatHistory = async () => {
        if (!userId) return;
        
        try {
            const history = await chatService.getChatHistory(userId);
            setMessages(history);
        } catch (error) {
            console.error('Failed to load chat history:', error);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || loading || !userId) return;

        setLoading(true);
        try {
            const response = await chatService.sendMessage(userId, newMessage);
            setMessages(prev => [...prev, response.user_message, response.ai_response]);
            setNewMessage('');
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setLoading(false);
        }
    };

    // If no userId is available, don't render the chat widget
    if (!userId) return null;

    return (
        <div className="chat-widget-container">
            {/* Chat Toggle Button */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="chat-widget-toggle"
            >
                {isOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                )}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="chat-widget-window">
                    <div className="chat-widget-header">
                        <h3>English & IELTS Assistant</h3>
                    </div>
                    
                    <div className="chat-widget-messages">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`chat-message ${msg.role === 'user' ? 'user-message' : 'assistant-message'}`}
                            >
                                {msg.message}
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                    
                    <form onSubmit={handleSendMessage} className="chat-widget-input">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Ask about English or IELTS..."
                            disabled={loading}
                        />
                        <button
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="loading-spinner"></span>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            )}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
} 