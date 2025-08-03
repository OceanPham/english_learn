import React, { useEffect, useState } from 'react';
import { getDashboardStats, getUserGrowth, getSubscriptionStats } from '../../services/admin.service';
import { DashboardStats, SubscriptionStats } from '../../types/admin.types';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
      text: 'User Growth Over Time',
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1,
        precision: 0
      }
    }
  }
};

const Statistics: React.FC = () => {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [userGrowth, setUserGrowth] = useState<Array<{ month: string; count: number }>>([]);
  const [subscriptionStats, setSubscriptionStats] = useState<SubscriptionStats | null>(null);
  const [loading, setLoading] = useState({
    dashboard: true,
    growth: true,
    subscriptions: true,
  });

  // Prepare chart data
  const chartData = {
    labels: userGrowth.map(item => {
      const date = new Date(item.month);
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }),
    datasets: [
      {
        label: 'Number of Users',
        data: userGrowth.map(item => item.count),
        borderColor: 'rgb(79, 70, 229)',
        backgroundColor: 'rgba(79, 70, 229, 0.5)',
        tension: 0.3,
        fill: true,
      },
    ],
  };
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError('');
        setLoading(prev => ({
          ...prev,
          dashboard: true,
          growth: true,
          subscriptions: true,
        }));

        // Fetch dashboard stats
        const stats = await getDashboardStats();
        setDashboardStats(stats);
        setLoading(prev => ({ ...prev, dashboard: false }));

        // Fetch user growth
        const growthResponse = await getUserGrowth();
        // Format the growth data to match the expected format
        const formattedGrowth = growthResponse.map((item: any) => ({
          month: item.month,
          count: item.count
        }));
        setUserGrowth(formattedGrowth);
        setLoading(prev => ({ ...prev, growth: false }));

        // Fetch subscription stats
        const subscriptionsResponse = await getSubscriptionStats() as unknown as SubscriptionStats;
        setSubscriptionStats(subscriptionsResponse);
        setLoading(prev => ({ ...prev, subscriptions: false }));
      } catch (err) {
        setError('Failed to fetch statistics. Please try again later.');
        console.error('Error fetching statistics:', err);
        setLoading(prev => ({
          ...prev,
          dashboard: false,
          growth: false,
          subscriptions: false,
        }));
      }
    };

    fetchData();
  }, []);

  // Format currency
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  // Get plan emoji
  const getPlanEmoji = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'free':
        return '🎵';
      case 'student':
        return '🎓';
      case 'pro':
        return '✨';
      case 'unlimited':
        return '🚀';
      default:
        return '📊';
    }
  };

  // Loading state
  if (loading.dashboard && loading.growth && loading.subscriptions) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">{error}</h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">User Growth Statistics</h1>
      </div>

      {/* User Growth Chart */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="h-96">
          {loading.growth ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : userGrowth.length > 0 ? (
            <Line options={options} data={chartData} />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              No user growth data available
            </div>
          )}
        </div>
      </div>

      {/* User Growth Data Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">User Growth Data</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Month
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  New Users
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Users
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading.growth ? (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                    Loading data...
                  </td>
                </tr>
              ) : userGrowth.length > 0 ? (
                userGrowth.map((item, index) => {
                  const totalUsers = userGrowth
                    .slice(0, index + 1)
                    .reduce((sum, curr) => sum + curr.count, 0);
                  
                  return (
                    <tr key={item.month} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(item.month)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {totalUsers}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                    No user growth data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
