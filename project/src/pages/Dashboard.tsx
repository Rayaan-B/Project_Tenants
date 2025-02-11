import React from 'react';
import { useStore } from '../lib/store';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Label
} from 'recharts';
import { formatCurrency } from '../utils/currency';

function Dashboard() {
  const { payments, tenants, fetchPayments, fetchTenants, darkMode } = useStore();

  React.useEffect(() => {
    fetchPayments();
    fetchTenants();
  }, []);

  // Calculate payment statistics
  const totalPayments = payments.length;
  const paidPayments = payments.filter(p => p.status === 'paid').length;
  const overduePayments = payments.filter(p => p.status === 'overdue').length;
  const pendingPayments = payments.filter(p => p.status === 'pending').length;
  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
  const paidAmount = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);

  const paymentStatusData = [
    { name: 'Paid', value: paidPayments },
    { name: 'Overdue', value: overduePayments },
    { name: 'Pending', value: pendingPayments },
  ];

  const COLORS = ['#10B981', '#EF4444', '#F59E0B'];

  // Monthly payment trends
  const monthlyPayments = payments.reduce((acc: any, payment) => {
    const month = new Date(payment.due_date).toLocaleString('default', { month: 'short' });
    if (!acc[month]) {
      acc[month] = { month, total: 0, paid: 0 };
    }
    acc[month].total += payment.amount;
    if (payment.status === 'paid') {
      acc[month].paid += payment.amount;
    }
    return acc;
  }, {});

  const monthlyTrendsData = Object.values(monthlyPayments);

  return (
    <div className={`p-6 pt-16 h-full ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="flex justify-between items-center mb-8">
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Dashboard Overview
        </h1>
        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 max-w-sm mx-auto">
        {/* Total Revenue Card */}
        <div className={`rounded-3xl p-6 ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        } shadow-sm hover:shadow-md transition-shadow duration-200`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Total Revenue
              </p>
              <p className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {formatCurrency(totalAmount)}
              </p>
            </div>
            <div className={`p-3 rounded-2xl ${darkMode ? 'bg-green-900/30' : 'bg-green-100'}`}>
              <svg className={`w-6 h-6 ${darkMode ? 'text-green-400' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className={`font-medium ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
              {((paidAmount / totalAmount) * 100).toFixed(1)}% collected
            </span>
          </div>
        </div>

        {/* Active Tenants Card */}
        <div className={`rounded-3xl p-6 ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        } shadow-sm hover:shadow-md transition-shadow duration-200`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Active Tenants
              </p>
              <p className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {tenants.length}
              </p>
            </div>
            <div className={`p-3 rounded-2xl ${darkMode ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
              <svg className={`w-6 h-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className={`font-medium ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
              Active leases
            </span>
          </div>
        </div>

        {/* Payment Status Card */}
        <div className={`rounded-3xl p-6 ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        } shadow-sm hover:shadow-md transition-shadow duration-200`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Payment Status
              </p>
              <p className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {totalPayments}
              </p>
            </div>
            <div className={`p-3 rounded-2xl ${darkMode ? 'bg-purple-900/30' : 'bg-purple-100'}`}>
              <svg className={`w-6 h-6 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center space-x-3 text-sm">
            <span className={`font-medium ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
              {paidPayments} paid
            </span>
            <span className={`font-medium ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
              {overduePayments} overdue
            </span>
          </div>
        </div>

        {/* Collection Rate Card */}
        <div className={`rounded-3xl p-6 ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        } shadow-sm hover:shadow-md transition-shadow duration-200`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Collection Rate
              </p>
              <p className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {((paidAmount / totalAmount) * 100).toFixed(0)}%
              </p>
            </div>
            <div className={`p-3 rounded-2xl ${darkMode ? 'bg-yellow-900/30' : 'bg-yellow-100'}`}>
              <svg className={`w-6 h-6 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className={`font-medium ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
              Payment efficiency
            </span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Payment Status Chart */}
        <div className={`rounded-3xl p-6 ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        } shadow-sm hover:shadow-md transition-shadow duration-200`}>
          <h3 className={`text-lg font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Payment Status Distribution
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {paymentStatusData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                  <Label
                    content={({ viewBox }) => {
                      if (!viewBox) return null;
                      // For PieChart, viewBox has centerX and centerY instead of cx and cy
                      const centerX = (viewBox as any).cx ?? (viewBox as any).centerX ?? 0;
                      const centerY = (viewBox as any).cy ?? (viewBox as any).centerY ?? 0;
                      return (
                        <text
                          x={centerX}
                          y={centerY}
                          fill={darkMode ? 'white' : 'black'}
                          textAnchor="middle"
                          dominantBaseline="central"
                          className="text-lg font-semibold"
                        >
                          {totalPayments}
                        </text>
                      );
                    }}
                  />
                </Pie>
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  content={({ payload }) => {
                    if (!payload) return null;
                    return (
                      <ul className="flex justify-center space-x-8">
                        {payload.map((entry, index) => (
                          <li key={`item-${index}`} className="flex items-center">
                            <span
                              className="w-3 h-3 rounded-full mr-2"
                              style={{ backgroundColor: entry.color }}
                            />
                            <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                              {entry.value}
                            </span>
                          </li>
                        ))}
                      </ul>
                    );
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: darkMode ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                    borderRadius: '16px',
                    border: `1px solid ${darkMode ? 'rgba(75, 85, 99, 0.4)' : 'rgba(229, 231, 235, 0.8)'}`,
                    color: darkMode ? 'white' : 'black'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Trends Chart */}
        <div className={`rounded-3xl p-6 ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        } shadow-sm hover:shadow-md transition-shadow duration-200`}>
          <h3 className={`text-lg font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Monthly Payment Trends
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrendsData}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={darkMode ? 'rgba(75, 85, 99, 0.2)' : 'rgba(107, 114, 128, 0.2)'} 
                />
                <XAxis
                  dataKey="month"
                  stroke={darkMode ? 'rgba(156, 163, 175, 0.7)' : 'rgba(107, 114, 128, 0.7)'}
                  tick={{ fill: darkMode ? 'rgba(156, 163, 175, 0.9)' : 'rgba(55, 65, 81, 0.9)' }}
                />
                <YAxis
                  stroke={darkMode ? 'rgba(156, 163, 175, 0.7)' : 'rgba(107, 114, 128, 0.7)'}
                  tick={{ fill: darkMode ? 'rgba(156, 163, 175, 0.9)' : 'rgba(55, 65, 81, 0.9)' }}
                  tickFormatter={(value) => `${formatCurrency(value)}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: darkMode ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                    borderRadius: '16px',
                    border: `1px solid ${darkMode ? 'rgba(75, 85, 99, 0.4)' : 'rgba(229, 231, 235, 0.8)'}`,
                    color: darkMode ? 'white' : 'black'
                  }}
                  formatter={(value) => [`${formatCurrency(value as number)}`, '']}
                />
                <Bar dataKey="total" fill={darkMode ? '#8B5CF6' : '#6D28D9'} radius={[4, 4, 0, 0]} />
                <Bar dataKey="paid" fill={darkMode ? '#10B981' : '#059669'} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;