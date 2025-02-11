import React, { useRef } from 'react';
import { Payment, Tenant } from '../lib/types';
import { formatCurrency } from '../utils/currency';

interface MonthlyPaymentBreakdownProps {
  tenant: Tenant;
  payments: Payment[];
}

interface MonthlyRecord {
  month: string;
  expectedAmount: number;
  payments: {
    amount: number;
    date: string;
    method: string | null;
    notes: string | null;
    mpesa_code: string | null;
  }[];
  totalPaid: number;
  status: 'Fully Paid' | 'Partial' | 'Unpaid';
  balance: number;
}

export const MonthlyPaymentBreakdown: React.FC<MonthlyPaymentBreakdownProps> = ({
  tenant,
  payments,
}) => {
  const getMonthlyBreakdown = (): MonthlyRecord[] => {
    const records: MonthlyRecord[] = [];
    let runningBalance = 0;
    
    // Get start date from lease_start
    const startDate = new Date(tenant.lease_start);
    const currentDate = new Date();
    
    // Create a map of payments by month
    const paymentsByMonth = new Map<string, Payment[]>();
    payments.forEach(payment => {
      if (payment.payment_date) {
        const paymentDate = new Date(payment.payment_date);
        const monthKey = `${paymentDate.getFullYear()}-${paymentDate.getMonth() + 1}`;
        const currentPayments = paymentsByMonth.get(monthKey) || [];
        paymentsByMonth.set(monthKey, [...currentPayments, payment]);
      }
    });

    // Generate records for each month from lease start to current date
    let currentMonth = new Date(startDate);
    while (currentMonth <= currentDate) {
      const monthKey = `${currentMonth.getFullYear()}-${currentMonth.getMonth() + 1}`;
      const expectedAmount = tenant.rent_amount;
      const monthPayments = paymentsByMonth.get(monthKey) || [];
      const totalPaid = monthPayments.reduce((sum, p) => sum + p.amount, 0);
      
      runningBalance = runningBalance + expectedAmount - totalPaid;
      
      let status: MonthlyRecord['status'];
      if (totalPaid >= expectedAmount && runningBalance <= 0) {
        status = 'Fully Paid';
      } else if (totalPaid > 0) {
        status = 'Partial';
      } else {
        status = 'Unpaid';
      }

      records.push({
        month: currentMonth.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long' 
        }),
        expectedAmount,
        payments: monthPayments.map(p => ({
          amount: p.amount,
          date: new Date(p.payment_date!).toLocaleDateString(),
          method: p.payment_method,
          notes: p.notes,
          mpesa_code: p.mpesa_code
        })),
        totalPaid,
        status,
        balance: runningBalance
      });

      // Move to next month
      currentMonth.setMonth(currentMonth.getMonth() + 1);
    }

    return records;
  };

  const getStatusColor = (status: MonthlyRecord['status']) => {
    switch (status) {
      case 'Fully Paid':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300';
      case 'Partial':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300';
      case 'Unpaid':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300';
    }
  };

  const breakdownRef = useRef<HTMLDivElement>(null);
  const monthlyRecords = getMonthlyBreakdown();

  return (
    <div ref={breakdownRef} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Monthly Payment Breakdown
        </h3>
        <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {tenant.tenant_name} - Room {tenant.unit?.unit_number}
        </div>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {/* Mobile View */}
        <div className="block sm:hidden">
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {monthlyRecords.map((record, idx) => (
              <div key={idx} className="p-4 space-y-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                {/* Month and Status Header */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="text-base font-medium text-gray-900 dark:text-white">
                      {record.month}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Expected: {formatCurrency(record.expectedAmount)}
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusColor(record.status)}`}>
                    {record.status}
                  </span>
                </div>

                {/* Payments Section */}
                <div className="space-y-3">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Payments</div>
                  {record.payments.length > 0 ? (
                    <div className="space-y-2">
                      {record.payments.map((payment, pidx) => (
                        <div key={pidx} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 space-y-2">
                          {/* Amount and Date */}
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {formatCurrency(payment.amount)}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {payment.date}
                              </div>
                            </div>
                            {payment.method && (
                              <div className="text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-600/50 px-2 py-1 rounded">
                                {payment.method}
                              </div>
                            )}
                          </div>

                          {/* Mpesa Code */}
                          {payment.mpesa_code && (
                            <div className="text-xs bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 p-2 rounded">
                              Mpesa Code: {payment.mpesa_code}
                            </div>
                          )}

                          {/* Notes */}
                          {payment.notes && (
                            <div className="text-xs bg-gray-100 dark:bg-gray-600/50 text-gray-600 dark:text-gray-300 p-2 rounded">
                              Note: {payment.notes}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                      No payments recorded
                    </div>
                  )}
                </div>

                {/* Summary Section */}
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Total Paid</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                      {formatCurrency(record.totalPaid)}
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Balance</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                      {formatCurrency(Math.abs(record.balance))}
                      {record.balance > 0 ? ' (Due)' : ''}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Month
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Expected
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Payments
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Balance
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {monthlyRecords.map((record, idx) => (
                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {record.month}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {formatCurrency(record.expectedAmount)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {record.payments.length > 0 ? (
                      <div className="space-y-2">
                        {record.payments.map((payment, pidx) => (
                          <div key={pidx} className="space-y-1">
                            <div className="flex items-center gap-3">
                              <span>{formatCurrency(payment.amount)}</span>
                              <span className="text-gray-500 dark:text-gray-400 text-xs">
                                {payment.date}
                                {payment.method && ` - ${payment.method}`}
                              </span>
                            </div>
                            {payment.mpesa_code && (
                              <div className="text-xs bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 p-1.5 rounded">
                                Mpesa Code: {payment.mpesa_code}
                              </div>
                            )}
                            {payment.notes && (
                              <div className="text-xs bg-gray-100 dark:bg-gray-600/50 text-gray-600 dark:text-gray-300 p-1.5 rounded">
                                Note: {payment.notes}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400">No payments</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(record.status)}`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {formatCurrency(Math.abs(record.balance))}
                    {record.balance > 0 ? ' (Due)' : ''}
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

export default MonthlyPaymentBreakdown;
