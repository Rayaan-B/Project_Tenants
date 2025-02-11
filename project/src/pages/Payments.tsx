import React from 'react';
import { useStore } from '../lib/store';
import { Plus, Edit, Trash2 } from 'lucide-react';
import PaymentModal from '../components/PaymentModal';
import PaymentHistory from '../components/PaymentHistory';
import { toast } from 'react-hot-toast';
import { Payment } from '../lib/types';
import { formatCurrency } from '../utils/currency';

function Payments() {
  const { payments, fetchPayments, deletePayment } = useStore();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'list' | 'history'>('list');
  const [selectedPayment, setSelectedPayment] = React.useState<Payment | undefined>();

  React.useEffect(() => {
    fetchPayments().then(() => {
      console.log('Payments data:', payments);
    });
  }, [fetchPayments]);

  React.useEffect(() => {
    payments.forEach(payment => {
      console.log('Payment:', {
        id: payment.id,
        tenant: payment.tenant,
        unit: payment.tenant?.unit,
        unit_number: payment.tenant?.unit?.unit_number
      });
    });
  }, [payments]);

  const handleEdit = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsModalOpen(true);
  };

  const handleDelete = async (payment: Payment) => {
    if (window.confirm('Are you sure you want to delete this payment?')) {
      try {
        await deletePayment(payment.id);
        toast.success('Payment deleted successfully');
      } catch (error) {
        toast.error('Error deleting payment');
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPayment(undefined);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300';
      case 'overdue':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300';
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="p-6 pt-16 h-full bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Payments Overview</h1>
        <div className="text-sm text-gray-500 dark:text-gray-400">Last updated: {new Date().toLocaleDateString()}</div>
      </div>

      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full max-w-sm mx-auto mb-6 inline-flex items-center justify-center px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
      >
        <Plus className="h-5 w-5 mr-2" />
        Add Payment
      </button>

      <div className="grid grid-cols-1 gap-4 max-w-sm mx-auto">
        {/* Total Payments Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-all duration-200 hover:shadow-md border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Total Payments</div>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(payments.reduce((sum, p) => sum + p.amount, 0))}
              </div>
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Paid Payments Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-all duration-200 hover:shadow-md border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Paid Payments</div>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0))}
              </div>
              <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Payments Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-all duration-200 hover:shadow-md border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Pending Payments</div>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0))}
              </div>
              <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Overdue Payments Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-all duration-200 hover:shadow-md border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Overdue Payments</div>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(payments.filter(p => p.status === 'overdue').reduce((sum, p) => sum + p.amount, 0))}
              </div>
              <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden max-w-7xl mx-auto mt-8">
        <div className="border-b border-gray-100 dark:border-gray-700">
          <nav className="flex space-x-4 sm:space-x-8 px-4 sm:px-6">
            <button
              onClick={() => setActiveTab('list')}
              className={`${
                activeTab === 'list'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
            >
              Payment List
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`${
                activeTab === 'history'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
            >
              Payment History
            </button>
          </nav>
        </div>

        {activeTab === 'list' ? (
          <div className="w-full overflow-x-auto">
            <div className="block sm:hidden">
              {/* Mobile View */}
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {payments.map((payment) => (
                  <div key={payment.id} className="p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          Room {payment.tenant?.unit?.unit_number}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {payment.tenant?.tenant_name}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatCurrency(payment.amount)}
                        </div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                      <div className="space-y-1">
                        <div>Due: {new Date(payment.due_date).toLocaleDateString()}</div>
                        {payment.payment_date && (
                          <div>Paid: {new Date(payment.payment_date).toLocaleDateString()}</div>
                        )}
                        {payment.payment_method && (
                          <div>Via: {payment.payment_method}</div>
                        )}
                        {payment.mpesa_code && (
                          <div className="text-violet-600 dark:text-violet-400">
                            Mpesa: {payment.mpesa_code}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleEdit(payment)}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(payment)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop View */}
            <table className="hidden sm:table min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Tenant
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Payment Date
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {payment.tenant?.unit?.unit_number}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {payment.tenant?.tenant_name}
                      </div>
                      <div className="sm:hidden text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Due: {new Date(payment.due_date).toLocaleDateString()}
                      </div>
                      {payment.payment_date && (
                        <div className="sm:hidden text-xs text-gray-500 dark:text-gray-400">
                          Paid: {new Date(payment.payment_date).toLocaleDateString()}
                        </div>
                      )}
                      <div className="sm:hidden text-xs text-gray-500 dark:text-gray-400">
                        {payment.payment_method || '-'}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">
                        {formatCurrency(payment.amount)}
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {new Date(payment.due_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {payment.payment_date
                          ? new Date(payment.payment_date).toLocaleDateString()
                          : '-'}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          payment.status
                        )}`}
                      >
                        {payment.status.charAt(0).toUpperCase() +
                          payment.status.slice(1)}
                      </span>
                    </td>
                    <td className="hidden sm:table-cell px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {payment.payment_method || '-'}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-right">
                      <div className="flex items-center justify-end space-x-3">
                        <button
                          onClick={() => handleEdit(payment)}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors duration-200"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(payment)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <PaymentHistory />
        )}
      </div>

      <PaymentModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        payment={selectedPayment}
      />
    </div>
  );
}

export default Payments;