import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../../services/auth.service';
import vnpayApi from '../../services/vnpay.service';

interface PlanOption {
  id: string;
  name: string;
  price: number;
  features: string[];
  description: string;
  icon: string;
}

const Plans: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = authService.getCurrentUser();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(
    currentUser?.subscription?.plan || null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const plans: PlanOption[] = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      description: 'Try out our essay grading service',
      icon: '🎁',
      features: [
        '2 bài essay miễn phí',
        'Chấm điểm theo tiêu chí IELTS',
        'Phân tích lỗi cơ bản',
        'Truy cập thư viện đề thi cơ bản'
      ]
    },
    {
      id: 'student',
      name: 'Student',
      price: 99000,
      description: 'Perfect for students preparing for IELTS',
      icon: '👨‍🎓',
      features: [
        '50 bài essay mỗi tháng',
        'Chấm điểm chi tiết theo tiêu chí IELTS',
        'Phân tích lỗi sai và gợi ý cải thiện',
        'Email hỗ trợ trong 24h',
        'Truy cập thư viện đề thi'
      ]
    },
    {
      id: 'pro',
      name: 'Professional',
      price: 199000,
      description: 'Ideal for serious IELTS candidates',
      icon: '🌟',
      features: [
        '200 bài essay mỗi tháng',
        'Chấm điểm và phản hồi ngay lập tức',
        'Gợi ý cải thiện theo từng tiêu chí',
        'Chat AI hỗ trợ 24/7',
        'Thư viện đề thi độc quyền',
        'Báo cáo tiến độ hàng tuần',
        'Ưu tiên hỗ trợ kỹ thuật'
      ]
    },
    {
      id: 'unlimited',
      name: 'Unlimited',
      price: 499000,
      description: 'For educational institutions & IELTS centers',
      icon: '🚀',
      features: [
        'Không giới hạn số bài essay',
        'Tất cả tính năng của gói Professional',
        'API tích hợp hệ thống',
        'Quản lý học viên theo nhóm',
        'Thống kê và báo cáo chi tiết',
        'Hỗ trợ kỹ thuật 24/7',
        'Đào tạo sử dụng hệ thống'
      ]
    }
  ];

  // Định nghĩa thứ tự các gói từ thấp đến cao
  const planOrder = {
    'free': 0,
    'student': 1,
    'pro': 2,
    'unlimited': 3
  };

  // Function to check if a plan can be selected (cannot downgrade)
  const canSelectPlan = (planId: string) => {
    if (!currentUser?.subscription?.plan) return true; // Can select if no current plan
    
    // Ensure both plans exist in planOrder before comparing
    const currentPlanKey = currentUser.subscription.plan as keyof typeof planOrder;
    const newPlanKey = planId as keyof typeof planOrder;
    
    if (!(currentPlanKey in planOrder) || !(newPlanKey in planOrder)) {
        console.warn("Plan ID not found in planOrder:", currentPlanKey, newPlanKey); 
        return false; // Or handle as appropriate, maybe allow selection?
    }

    const currentPlanOrder = planOrder[currentPlanKey];
    const newPlanOrder = planOrder[newPlanKey];
    
    // Only allow selecting the same plan (no action) or upgrading
    return newPlanOrder >= currentPlanOrder; 
  };

  // Get button message based on plan status
  const getButtonMessage = (plan: PlanOption) => {
    if (loading && selectedPlan === plan.id) return 'Processing...'; // Show processing only for the clicked button
    if (currentUser?.subscription?.plan === plan.id) return 'Current Plan';
    if (!canSelectPlan(plan.id)) return 'Upgrade Only'; // Changed message for clarity
    return 'Select Plan';
  };

  // Get button style based on plan status
  const getButtonStyle = (plan: PlanOption) => {
    const isCurrent = currentUser?.subscription?.plan === plan.id;
    const cannotSelect = !canSelectPlan(plan.id) && !isCurrent; // Cannot select if it's a downgrade
    const isDisabled = loading || isCurrent || cannotSelect;

    if (isCurrent) return 'bg-green-500 hover:bg-green-500 cursor-not-allowed';
    if (cannotSelect) return 'bg-gray-400 cursor-not-allowed'; 
    if (loading && selectedPlan === plan.id) return 'bg-gray-300 cursor-not-allowed'; // Loading style for the clicked button
    return 'bg-blue-500 hover:bg-blue-600'; // Default selectable style
  };

  const handlePlanSelect = async (planId: string) => {
    // Check if user is logged in
    if (!currentUser) {
      navigate('/login', { state: { from: location } }); // Redirect to login, remember where they came from
      return;
    }
    
    // Prevent action if plan cannot be selected (downgrade)
    if (!canSelectPlan(planId)) {
      setError('You can only upgrade your plan.');
      return;
    }
    
    // Prevent action if it's the current plan
    if (currentUser?.subscription?.plan === planId) {
        return; // Do nothing if clicking the current plan
    }

    setSelectedPlan(planId); // Indicate which plan is being processed
    setLoading(true);
    setError(null);

    try {
      const selectedPlanOption = plans.find(plan => plan.id === planId);
      if (!selectedPlanOption) {
        throw new Error('Invalid plan selected');
      }

      // Create VNPay payment URL
      const response = await vnpayApi.createPayment({
        price: selectedPlanOption.price,
        return_url: `${window.location.origin}/payment-callback`, // Correct callback URL
        // ipAddr: ... (Consider security implications of fetching IP on client-side)
      });

      // Store plan info in localStorage for verification in PaymentCallback.tsx
      localStorage.setItem('pendingSubscription', JSON.stringify({
        plan_id: planId
        // txnRef is not needed here as PaymentCallback gets it from URL
      }));

      // Redirect to VNPay payment page
      window.location.href = response.paymentUrl;

    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Failed to initiate payment');
      setSelectedPlan(currentUser?.subscription?.plan || null); // Reset visual selection on error
    } finally {
      setLoading(false);
    }
  };

  // REMOVED the useEffect for handling payment callback here.
  // PaymentCallback.tsx component is now responsible for this.

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Choose Your Plan
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
            Select the perfect plan for your IELTS preparation journey
          </p>
        </div>

        {location.state?.success && (
          <div className="mt-8 max-w-md mx-auto bg-green-50 border border-green-400 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">{location.state.success}</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-8 max-w-md mx-auto bg-red-50 border border-red-400 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-16 grid gap-8 lg:grid-cols-3 lg:gap-x-8">
          {plans.map((plan) => {
            const isCurrent = currentUser?.subscription?.plan === plan.id;
            const cannotSelect = !canSelectPlan(plan.id) && !isCurrent;
            const isDisabled = loading || isCurrent || cannotSelect;

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl shadow-xl overflow-hidden transition-all duration-300 transform hover:scale-105
                  ${isCurrent ? 'ring-4 ring-blue-500 scale-105' : 'hover:shadow-2xl'}
                  bg-white`}
              >
                <div className="p-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                      <span className="text-3xl">{plan.icon}</span>
                      {plan.name}
                    </h3>
                    {isCurrent && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Current Plan
                      </span>
                    )}
                  </div>

                  <p className="mt-4 text-sm text-gray-500">{plan.description}</p>

                  <p className="mt-8">
                    <span className="text-4xl font-extrabold text-gray-900">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
                        .format(plan.price)}
                    </span>
                    <span className="text-base font-medium text-gray-500">/month</span>
                  </p>

                  <ul className="mt-6 space-y-4">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="h-6 w-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <p className="ml-3 text-base text-gray-700">{feature}</p>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8">
                    <button
                      onClick={() => !isDisabled && handlePlanSelect(plan.id)} // Only call if not disabled
                      disabled={isDisabled}
                      className={`w-full rounded-xl px-4 py-3 text-base font-semibold shadow-sm transition-all duration-200 text-white
                        ${getButtonStyle(plan)}`}
                    >
                      {getButtonMessage(plan)}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-16 max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900">Common Features</h2>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: '📝', title: 'AI Scoring', desc: 'Instant IELTS band score prediction' },
              { icon: '🎯', title: 'Detailed Feedback', desc: 'Comprehensive analysis of your writing' },
              { icon: '📊', title: 'Progress Tracking', desc: 'Monitor your improvement over time' },
              { icon: '🔄', title: 'Unlimited Revisions', desc: 'Practice until you perfect' },
              { icon: '📚', title: 'Sample Essays', desc: 'Learn from high-scoring examples' },
              { icon: '🤖', title: 'AI Assistant', desc: 'Get help whenever you need' }
            ].map((feature, index) => (
              <div key={index} className="bg-white rounded-lg p-5 shadow-md">
                <div className="text-2xl mb-2">{feature.icon}</div>
                <h3 className="text-lg font-medium text-gray-900">{feature.title}</h3>
                <p className="mt-2 text-sm text-gray-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Plans; 