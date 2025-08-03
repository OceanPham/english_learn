import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../../services/auth.service';
import subscriptionService from '../../services/subscription.service';
import { Subscription } from '../../types/auth.types';

const PaymentCallback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Đang xử lý đăng ký...');

  useEffect(() => {
    const processSubscription = async () => {
      try {
        const pendingSubscription = localStorage.getItem('pendingSubscription');
        if (!pendingSubscription) {
          throw new Error('Không tìm thấy thông tin đăng ký');
        }

        const { plan_id } = JSON.parse(pendingSubscription) as { plan_id: Subscription['plan'] };

        const response = await subscriptionService.createSubscription(plan_id);

        if (response.message === 'Subscription created successfully') {
          const user = authService.getCurrentUser();
          if (user) {
            user.subscription = {
              plan: response.subscription.plan as Subscription['plan'],
              status: response.subscription.status as Subscription['status'],
              start_date: response.subscription.start_date,
              end_date: response.subscription.end_date,
            };
            localStorage.setItem('user', JSON.stringify(user));
          }

          setStatus('success');
          setMessage('Đăng ký thành công! Đang chuyển hướng...');
          
          setTimeout(() => {
            navigate('/plans', {
              state: { success: 'Đăng ký gói dịch vụ thành công!' }
            });
          }, 2000);
        }
      } catch (err) {
        console.error('Subscription creation failed:', err);
        setStatus('error');
        setMessage('Đăng ký thất bại. Vui lòng thử lại hoặc liên hệ hỗ trợ.');
      } finally {
        localStorage.removeItem('pendingSubscription');
      }
    };

    processSubscription();
  }, [location.search, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg">
        {status === 'processing' && (
          <>
            <div className="flex justify-center mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
            <h2 className="text-center text-xl font-semibold text-gray-700">
              Đang xử lý đăng ký
            </h2>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="flex justify-center mb-4">
              <svg
                className="w-16 h-16 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-center text-xl font-semibold text-green-600">
              Đăng ký thành công!
            </h2>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="flex justify-center mb-4">
              <svg 
                className="w-16 h-16 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <h2 className="text-center text-xl font-semibold text-red-600">
              Đăng ký thất bại
            </h2>
          </>
        )}

        <p className="mt-4 text-center text-gray-600">{message}</p>

        {status === 'error' && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => navigate('/plans')}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Quay lại trang gói dịch vụ
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentCallback; 