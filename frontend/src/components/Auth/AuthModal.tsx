import React, { useState } from 'react';
import styles from './AuthModal.module.css';
import authService from '../../services/auth.service';
import { LoginRequest, RegisterRequest } from '../../types/auth.types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const loginData: LoginRequest = {
          email,
          password,
        };
        await authService.login(loginData);
      } else {
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          return;
        }
        const registerData: RegisterRequest = {
          email,
          password,
          full_name: fullName,
        };
        await authService.register(registerData);
      }
      
      // Close modal and refresh page on success
      onClose();
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose}>×</button>
        
        <div className={styles.modalHeader}>
          <div className={styles.logo}>BandBoost</div>
          <h2>{isLogin ? 'Welcome Back!' : 'Create Your Account'}</h2>
          <p className={styles.subtitle}>
            {isLogin 
              ? 'Enter your details to access your account' 
              : 'Join BandBoost to start your IELTS journey'}
          </p>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form className={styles.form} onSubmit={handleSubmit}>
          {!isLogin && (
            <div className={styles.inputGroup}>
              <label>Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className={styles.input}
                required
                disabled={loading}
              />
            </div>
          )}
          
          <div className={styles.inputGroup}>
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className={styles.input}
              required
              disabled={loading}
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className={styles.input}
              required
              disabled={loading}
            />
          </div>

          {!isLogin && (
            <div className={styles.inputGroup}>
              <label>Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className={styles.input}
                required
                disabled={loading}
              />
            </div>
          )}

          {isLogin && (
            <div className={styles.rememberForgot}>
              <label className={styles.checkboxLabel}>
                <input type="checkbox" className={styles.checkbox} disabled={loading} />
                <span>Remember Me</span>
              </label>
              <a href="#" className={styles.forgotPassword}>Forgot Password?</a>
            </div>
          )}

          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={loading}
          >
            {loading 
              ? 'Please wait...' 
              : (isLogin ? 'Sign In' : 'Create Account')
            }
          </button>
        </form>

        <div className={styles.switchMode}>
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <button 
            className={styles.switchButton}
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            disabled={loading}
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal; 