import React from 'react';
import { useStore } from '../lib/store';
import { Tenant } from '../lib/types';

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

  if (loading) {
    return <div className="text-gray-600 dark:text-gray-400">Loading payment information...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by tenant name or unit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:border-indigo-500"
          />
        </div>
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 dark:focus:border-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
            <option value="unpaid">Unpaid</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tenant
                </th>
                <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Monthly Rent
                </th>
                <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Total Due
                </th>
                <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Total Paid
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Balance
                </th>
                <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Last Payment
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredSummaries.map((summary, index) => (
                <tr
                  key={summary.tenant.id}
                  className={`${
                    index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800/50' : 'bg-white dark:bg-gray-800'
                  } hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors cursor-pointer`}
                >
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {summary.tenant.unit?.unit_number}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {summary.tenant.tenant_name}
                    </div>
                    <div className="sm:hidden text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Monthly: KES {summary.tenant.rent_amount.toLocaleString()}
                    </div>
                    <div className="sm:hidden text-xs text-gray-500 dark:text-gray-400">
                      Due: KES {summary.totalRentDue.toLocaleString()}
                    </div>
                    <div className="sm:hidden text-xs text-gray-500 dark:text-gray-400">
                      Paid: KES {summary.totalPaid.toLocaleString()}
                    </div>
                    <div className="sm:hidden text-xs text-gray-500 dark:text-gray-400">
                      Last Payment: {summary.lastPaymentDate
                        ? new Date(summary.lastPaymentDate).toLocaleDateString()
                        : '-'}
                    </div>
                  </td>
                  <td className="hidden sm:table-cell px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="text-sm text-gray-900 dark:text-white">
                      KES {summary.tenant.rent_amount.toLocaleString()}
                    </div>
                  </td>
                  <td className="hidden sm:table-cell px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="text-sm text-gray-900 dark:text-white">
                      KES {summary.totalRentDue.toLocaleString()}
                    </div>
                  </td>
                  <td className="hidden sm:table-cell px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="text-sm text-gray-900 dark:text-white">
                      KES {summary.totalPaid.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="text-sm text-gray-900 dark:text-white">
                      KES {summary.balance.toLocaleString()}
                    </div>
                  </td>
                  <td className="hidden sm:table-cell px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {summary.lastPaymentDate
                        ? new Date(summary.lastPaymentDate).toLocaleDateString()
                        : '-'}
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-gray-500 dark:text-gray-400">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(
                        summary.paymentStatus
                      )}`}
                    >
                      {summary.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PaymentHistory;
