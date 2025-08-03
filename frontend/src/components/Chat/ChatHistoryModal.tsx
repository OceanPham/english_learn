import React, { useState, useEffect } from 'react';
import styles from './ChatHistoryModal.module.css';
import chatService from '../../services/chat.service';

interface ChatHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

interface ChatMessage {
  id: string;
  message: string;
  role: string;
  created_at: string;
}

const ChatHistoryModal: React.FC<ChatHistoryModalProps> = ({ isOpen, onClose, userId }) => {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && userId) {
      loadChatHistory();
    }
  }, [isOpen, userId]);

  const loadChatHistory = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const history = await chatService.getChatHistory(userId);
      setChatHistory(history);
    } catch (err) {
      setError('Failed to load chat history. Please try again later.');
      console.error('Error loading chat history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Chat History</h2>
          <button onClick={onClose} className={styles.closeButton}>
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        <div className={styles.modalBody}>
          {isLoading ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner}></div>
              <p>Loading chat history...</p>
            </div>
          ) : error ? (
            <div className={styles.errorState}>
              <p>{error}</p>
              <button onClick={loadChatHistory} className={styles.retryButton}>
                Try Again
              </button>
            </div>
          ) : chatHistory.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No chat history found.</p>
              <p className={styles.emptyStateSubtext}>
                Start a new conversation to see your history here.
              </p>
            </div>
          ) : (
            <div className={styles.chatList}>
              {chatHistory.map((chat) => (
                <div 
                  key={chat.id} 
                  className={`${styles.chatItem} ${
                    chat.role === 'user' ? styles.userMessage : styles.assistantMessage
                  }`}
                >
                  <div className={styles.messageContent}>
                    <p>{chat.message}</p>
                    <span className={styles.timestamp}>
                      {new Date(chat.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatHistoryModal; 