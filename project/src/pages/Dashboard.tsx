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
    <div className={`${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header section - Only visible on desktop */}
      <div className="hidden md:flex justify-between items-center mb-6">
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Dashboard Overview
        </h1>
        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
          Last updated: {new Date().toLocaleDateString('en-GB')}
        </div>
      </div>

      {/* Mobile header - Only visible on mobile */}
      <div className="md:hidden flex flex-col px-4 py-2">
        <h1 className={`text-2xl sm:text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Dashboard Overview</h1>
        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
          Last updated: {new Date().toLocaleDateString('en-GB')}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-4 px-4 md:gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue Card */}
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm p-4 transition-all duration-200 border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Total Revenue
              </p>
              <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mt-1`}>
                {formatCurrency(totalAmount)}
              </p>
            </div>
            <div className={`p-2 ${darkMode ? 'bg-green-900' : 'bg-green-100'} rounded-full`}>
              <svg className={`w-5 h-5 ${darkMode ? 'text-green-400' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-2 flex items-center text-xs">
            <span className={`${darkMode ? 'text-green-400' : 'text-green-600'} font-medium`}>
              100.0% collected
            </span>
          </div>
        </div>

        {/* Active Tenants Card */}
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm p-4 transition-all duration-200 border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Active Tenants
              </p>
              <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mt-1`}>
                {tenants.length}
              </p>
            </div>
            <div className={`p-2 ${darkMode ? 'bg-blue-900' : 'bg-blue-100'} rounded-full`}>
              <svg className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-2 flex items-center text-xs">
            <span className={`${darkMode ? 'text-blue-400' : 'text-blue-600'} font-medium`}>
              Active leases
            </span>
          </div>
        </div>

        {/* Payment Status Card */}
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm p-4 transition-all duration-200 border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Payment Status
              </p>
              <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mt-1`}>
                {totalPayments}
              </p>
            </div>
            <div className={`p-2 ${darkMode ? 'bg-purple-900' : 'bg-purple-100'} rounded-full`}>
              <svg className={`w-5 h-5 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs">
            <span className={`${darkMode ? 'text-green-400' : 'text-green-600'}`}>{paidPayments} paid</span>
            <span className={`${darkMode ? 'text-red-400' : 'text-red-600'}`}>{overduePayments} overdue</span>
          </div>
        </div>

        {/* Collection Rate Card */}
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm p-4 transition-all duration-200 border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Collection Rate
              </p>
              <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mt-1`}>
                100%
              </p>
            </div>
            <div className={`p-2 ${darkMode ? 'bg-yellow-900' : 'bg-yellow-100'} rounded-full`}>
              <svg className={`w-5 h-5 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <div className="mt-2 flex items-center text-xs">
            <span className={`${darkMode ? 'text-yellow-400' : 'text-yellow-600'} font-medium`}>
              Payment efficiency
            </span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-4 px-4 py-4 md:gap-6 md:grid-cols-2">
        {/* Payment Distribution Chart */}
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm p-4 transition-all duration-200 border`}>
          <h2 className={`text-base font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Payment Status Distribution
          </h2>
          <div className="h-60 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {paymentStatusData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                  <Label value={`${paidPayments}`} position="center" fill={darkMode ? '#fff' : '#000'} />
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Payment Trends Chart */}
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm p-4 transition-all duration-200 border`}>
          <h2 className={`text-base font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Monthly Payment Trends
          </h2>
          <div className="h-60 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyTrendsData}
                margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: darkMode ? '#9CA3AF' : '#6B7280' }} 
                  axisLine={{ stroke: darkMode ? '#4B5563' : '#D1D5DB' }} 
                />
                <YAxis 
                  tick={{ fill: darkMode ? '#9CA3AF' : '#6B7280' }} 
                  axisLine={{ stroke: darkMode ? '#4B5563' : '#D1D5DB' }} 
                  tickFormatter={(value) => `${value / 1000}k`} 
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                    border: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`,
                    color: darkMode ? '#FFFFFF' : '#000000'
                  }}
                />
                <Bar dataKey="total" name="Total" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="paid" name="Paid" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;