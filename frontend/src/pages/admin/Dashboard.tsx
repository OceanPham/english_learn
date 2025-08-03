import React, { useEffect, useState } from 'react';
import { getDashboardStats } from '../../services/admin.service';
import { DashboardStats } from '../../types/admin.types';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await getDashboardStats();
        setStats(data as DashboardStats);
      } catch (err) {
        setError('Failed to load dashboard statistics');
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard Overview</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Users */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 p-3 rounded-full">
                <span className="text-blue-600 text-xl">👥</span>
              </div>
              <div className="ml-4">
                <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                <dd className="text-2xl font-semibold text-gray-900">
                  {stats?.summary.total_users?.toLocaleString() || '0'}
                </dd>
              </div>
            </div>
          </div>
        </div>

        {/* New Users This Month */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 p-3 rounded-full">
                <span className="text-green-600 text-xl">📈</span>
              </div>
              <div className="ml-4">
                <dt className="text-sm font-medium text-gray-500 truncate">New Users (This Month)</dt>
                <dd className="text-2xl font-semibold text-gray-900">
                  +{stats?.summary.new_users_this_month?.toLocaleString() || '0'}
                </dd>
              </div>
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-100 p-3 rounded-full">
                <span className="text-purple-600 text-xl">💰</span>
              </div>
              <div className="ml-4">
                <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                <dd className="text-2xl font-semibold text-gray-900">
                  ${(stats?.summary.total_revenue || 0).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </dd>
              </div>
            </div>
          </div>
        </div>

        {/* Active Subscriptions */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-100 p-3 rounded-full">
                <span className="text-yellow-600 text-xl">📊</span>
              </div>
              <div className="ml-4">
                <dt className="text-sm font-medium text-gray-500 truncate">Active Subscriptions</dt>
                <dd className="text-2xl font-semibold text-gray-900">
                  {stats?.summary?.active_subscriptions?.toLocaleString() || '0'}
                </dd>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subscription Plans */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Subscription Plans</h2>
            <div className="space-y-4">
              {stats?.package_stats?.map((pkg) => (
                <div key={pkg.plan} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">
                      {pkg.plan === 'free' ? '🆓' : pkg.plan === 'pro' ? '⭐' : '💎'}
                    </span>
                    <div>
                      <div className="font-medium text-gray-900">
                        {pkg.plan.charAt(0).toUpperCase() + pkg.plan.slice(1)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {pkg.is_paid ? 'Paid Plan' : 'Free Plan'}
                      </div>
                    </div>
                  </div>
                  <div className="text-lg font-semibold">
                    {pkg.count.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* User Growth */}
          <div className="mt-6 bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">User Growth</h2>
            {stats?.charts?.user_growth?.length ? (
              <div className="space-y-2">
                {stats.charts.user_growth.map((growth, index) => (
                  <div key={index} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">
                      {new Date(growth.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                      +{growth.count} users
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No user growth data available</p>
            )}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activities</h2>
              <div className="flow-root">
                <ul className="-mb-8">
                  {stats?.recent_activities?.length ? (
                    stats.recent_activities.map((activity, index) => (
                      <li key={index} className="relative pb-8">
                        {index !== stats.recent_activities.length - 1 && (
                          <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                        )}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                              {activity.type === 'new_user' ? '👤' : '💳'}
                            </span>
                          </div>
                          <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                            <div>
                              <p className="text-sm text-gray-800">
                                {activity.type === 'new_user' ? (
                                  <span>New user <span className="font-medium">{activity.user_name}</span> registered</span>
                                ) : (
                                  <span>New payment of <span className="font-medium">${activity.amount?.toFixed(2)}</span> from {activity.user_name}</span>
                                )}
                              </p>
                              <p className="text-xs text-gray-500">
                                {activity.user_email}
                              </p>
                            </div>
                            <div className="whitespace-nowrap text-right text-sm text-gray-500">
                              {formatDate(activity.created_at)}
                            </div>
                          </div>
                        </div>
                      </li>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No recent activities</p>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Order Statistics */}
          <div className="mt-6 bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Order Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-green-800">Successful Orders</p>
                <p className="text-2xl font-semibold text-green-600">
                  {stats?.summary?.successful_orders || 0}
                </p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-yellow-800">Pending Orders</p>
                <p className="text-2xl font-semibold text-yellow-600">
                  {stats?.summary?.pending_orders || 0}
                </p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-red-800">Failed Orders</p>
                <p className="text-2xl font-semibold text-red-600">
                  {stats?.summary?.failed_orders || 0}
                </p>
              </div>
            </div>

            {stats?.charts?.order_status && stats.charts.order_status.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Order Status Distribution</h3>
                <div className="space-y-2">
                  {stats.charts.order_status.map((status, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        {status.status.charAt(0).toUpperCase() + status.status.slice(1)}
                      </span>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-500">{status.count} orders</span>
                        <span className="text-sm font-medium text-gray-900">
                          ${status.total?.toFixed(2) || '0.00'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
