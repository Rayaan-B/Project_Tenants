import React from 'react';
import { useStore } from '../lib/store';
import { Tenant } from '../lib/types';
import MonthlyPaymentBreakdown from './MonthlyPaymentBreakdown';

type TenantPaymentSummary = {
  tenant: Tenant;
  totalRentDue: number;
  totalPaid: number;
  balance: number;
  lastPaymentDate: string | null;
  paymentStatus: 'Paid' | 'Partial' | 'Unpaid';
};

const PaymentHistory: React.FC = () => {
  const { payments, tenants, fetchPayments, fetchTenants, loading } = useStore();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [selectedTenant, setSelectedTenant] = React.useState<Tenant | null>(null);
  const [showBackButton, setShowBackButton] = React.useState(false);
  const paymentHistoryRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleScroll = () => {
      if (paymentHistoryRef.current) {
        const historyRect = paymentHistoryRef.current.getBoundingClientRect();
        setShowBackButton(historyRect.bottom < 0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleBackToHistory = () => {
    paymentHistoryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  React.useEffect(() => {
    fetchPayments();
    fetchTenants();
  }, [fetchPayments, fetchTenants]);

  // Calculate payment summaries for each tenant
  const paymentSummaries = React.useMemo(() => {
    const summaries: TenantPaymentSummary[] = [];

    tenants.forEach((tenant) => {
      const tenantPayments = payments.filter(
        (payment) => payment.tenant_id === tenant.id
      );

      const currentDate = new Date();
      const leaseStartDate = new Date(tenant.lease_start);
      const monthsActive = Math.max(
        0,
        (currentDate.getFullYear() - leaseStartDate.getFullYear()) * 12 +
          (currentDate.getMonth() - leaseStartDate.getMonth())
      );

      const totalRentDue = tenant.rent_amount * monthsActive;
      const totalPaid = tenantPayments.reduce(
        (sum, payment) => sum + payment.amount,
        0
      );
      const balance = totalRentDue - totalPaid;

      const lastPayment = tenantPayments
        .filter((p) => p.payment_date)
        .sort(
          (a, b) =>
            new Date(b.payment_date!).getTime() -
            new Date(a.payment_date!).getTime()
        )[0];

      let paymentStatus: 'Paid' | 'Partial' | 'Unpaid';
      if (balance <= 0) {
        paymentStatus = 'Paid';
      } else if (totalPaid > 0) {
        paymentStatus = 'Partial';
      } else {
        paymentStatus = 'Unpaid';
      }

      summaries.push({
        tenant,
        totalRentDue,
        totalPaid,
        balance,
        lastPaymentDate: lastPayment?.payment_date || null,
        paymentStatus,
      });
    });

    return summaries;
  }, [payments, tenants]);

  // Filter summaries based on search and status
  const filteredSummaries = paymentSummaries.filter((summary) => {
    const matchesSearch =
      !searchQuery ||
      summary.tenant.tenant_name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      summary.tenant.unit?.unit_number
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      summary.paymentStatus.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const handleViewBreakdown = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    // Add small delay to ensure component is rendered before scrolling
    setTimeout(() => {
      const breakdownElement = document.querySelector('[data-breakdown]');
      if (breakdownElement) {
        breakdownElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300';
      case 'partial':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300';
      case 'unpaid':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
    }
  };

  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString()}`;
  };

  if (loading) {
    return <div className="text-gray-600 dark:text-gray-400">Loading payment information...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div ref={paymentHistoryRef} className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Search by tenant name or unit number..."
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 dark:bg-gray-800 dark:text-white text-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 dark:bg-gray-800 dark:text-white text-sm bg-white dark:bg-gray-800"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="paid">Paid</option>
          <option value="partial">Partial</option>
          <option value="unpaid">Unpaid</option>
        </select>
      </div>

      {/* Payment History Cards */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        {/* Mobile View */}
        <div className="block sm:hidden divide-y divide-gray-200 dark:divide-gray-700">
          {filteredSummaries.map((summary) => (
            <div
              key={summary.tenant.id}
              className="p-4 space-y-4 active:bg-gray-50 dark:active:bg-gray-700/50"
            >
              {/* Header */}
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="text-base font-medium text-gray-900 dark:text-white">
                    Room {summary.tenant.unit?.unit_number}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {summary.tenant.tenant_name}
                  </div>
                </div>
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusColor(summary.paymentStatus)}`}>
                  {summary.paymentStatus}
                </span>
              </div>

              {/* Payment Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Total Due</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                    {formatCurrency(summary.totalRentDue)}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Total Paid</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                    {formatCurrency(summary.totalPaid)}
                  </div>
                </div>
              </div>

              {/* Balance and Last Payment */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Balance:</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatCurrency(Math.abs(summary.balance))}
                    {summary.balance > 0 ? ' (Due)' : ''}
                  </div>
                </div>
                {summary.lastPaymentDate && (
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Last Payment:</div>
                    <div className="text-sm text-gray-900 dark:text-white">
                      {new Date(summary.lastPaymentDate).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </div>

              {/* View Details Button */}
              <button
                onClick={() => handleViewBreakdown(summary.tenant)}
                className="w-full mt-2 px-4 py-2 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 text-sm font-medium rounded-lg hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors duration-200"
              >
                View Monthly Breakdown
              </button>
            </div>
          ))}
        </div>

        {/* Desktop View */}
        <div className="hidden sm:block">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Tenant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Unit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Total Due
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Total Paid
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Balance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredSummaries.map((summary) => (
                  <tr 
                    key={summary.tenant.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                    onClick={() => handleViewBreakdown(summary.tenant)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {summary.tenant.tenant_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {summary.tenant.unit?.unit_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatCurrency(summary.totalRentDue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatCurrency(summary.totalPaid)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatCurrency(summary.balance)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(summary.paymentStatus)}`}>
                        {summary.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewBreakdown(summary.tenant);
                        }}
                        className="text-violet-600 hover:text-violet-900 dark:text-violet-400 dark:hover:text-violet-300"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Monthly Breakdown Section */}
      {selectedTenant && (
        <div data-breakdown>
          <MonthlyPaymentBreakdown
            tenant={selectedTenant}
            payments={payments.filter(p => p.tenant_id === selectedTenant.id)}
          />
        </div>
      )}

      {/* Floating Back Button */}
      {showBackButton && selectedTenant && (
        <button
          onClick={handleBackToHistory}
          className="fixed bottom-6 right-6 z-50 p-3 bg-violet-600 hover:bg-violet-700 text-white rounded-full shadow-lg transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default PaymentHistory;
