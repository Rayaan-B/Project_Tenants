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

  const [selectedTenant, setSelectedTenant] = React.useState<Tenant | null>(null);

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
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by tenant name or unit number..."
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 dark:bg-gray-800 dark:text-white"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 dark:bg-gray-800 dark:text-white"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="paid">Paid</option>
          <option value="partial">Partial</option>
          <option value="unpaid">Unpaid</option>
        </select>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        {/* Mobile View */}
        <div className="block sm:hidden">
          {filteredSummaries.map((summary) => (
            <div
              key={summary.tenant.id}
              className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-3"
              onClick={() => setSelectedTenant(summary.tenant)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    {summary.tenant.tenant_name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Unit: {summary.tenant.unit?.unit_number}
                  </p>
                </div>
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(summary.paymentStatus)}`}>
                  {summary.paymentStatus}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Total Due:</span>
                  <br />
                  <span className="text-gray-900 dark:text-white">{formatCurrency(summary.totalRentDue)}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Total Paid:</span>
                  <br />
                  <span className="text-gray-900 dark:text-white">{formatCurrency(summary.totalPaid)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Balance:</span>
                  <br />
                  <span className="text-gray-900 dark:text-white">{formatCurrency(summary.balance)}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTenant(summary.tenant);
                  }}
                  className="px-3 py-1 text-violet-600 hover:text-violet-900 dark:text-violet-400 dark:hover:text-violet-300 border border-violet-200 dark:border-violet-800 rounded-lg"
                >
                  View Details
                </button>
              </div>
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
                    onClick={() => setSelectedTenant(summary.tenant)}
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
                          setSelectedTenant(summary.tenant);
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

      {selectedTenant && (
        <div className="mt-6">
          <MonthlyPaymentBreakdown
            tenant={selectedTenant}
            payments={payments.filter(p => p.tenant_id === selectedTenant.id)}
          />
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;
