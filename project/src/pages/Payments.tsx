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
  const [expandedTenants, setExpandedTenants] = React.useState<Record<string, boolean>>({});

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
        return 'text-green-500 dark:text-green-400';
      case 'overdue':
        return 'text-red-500 dark:text-red-400';
      case 'pending':
        return 'text-yellow-500 dark:text-yellow-400';
      default:
        return 'text-gray-500 dark:text-gray-400';
    }
  };

  // Toggle expanded state for a tenant
  const toggleExpand = (tenantId: string) => {
    setExpandedTenants(prev => ({
      ...prev,
      [tenantId]: !prev[tenantId]
    }));
  };

  // Group payments by tenant
  const groupedPayments = React.useMemo(() => {
    const grouped: Record<string, Payment[]> = {};
    
    payments.forEach(payment => {
      if (payment.tenant_id) {
        if (!grouped[payment.tenant_id]) {
          grouped[payment.tenant_id] = [];
        }
        grouped[payment.tenant_id].push(payment);
      }
    });
    
    // Sort payments within each tenant group by date (most recent first)
    Object.keys(grouped).forEach(tenantId => {
      grouped[tenantId].sort((a, b) => {
        const dateA = a.payment_date ? new Date(a.payment_date).getTime() : new Date(a.due_date).getTime();
        const dateB = b.payment_date ? new Date(b.payment_date).getTime() : new Date(b.due_date).getTime();
        return dateB - dateA;
      });
    });
    
    return grouped;
  }, [payments]);

  return (
    <div className="space-y-8 p-4 sm:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-8">
        <div>
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-white">Payments Overview</h1>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Last updated: {new Date().toLocaleDateString('en-GB')}
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Payment
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="border-b border-gray-100 dark:border-gray-700">
          <nav className="flex space-x-4 sm:space-x-8 px-4 sm:px-6">
            <button
              type="button"
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
              type="button"
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

        {/* Pre-render both tabs but only show the active one */}
        <div>
          {/* Payment List Tab */}
          <div className={`${activeTab === 'list' ? 'block' : 'hidden'}`}>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {Object.keys(groupedPayments).length > 0 ? (
                Object.keys(groupedPayments).map(tenantId => (
                  <div key={tenantId} className="border-b border-gray-200 dark:border-gray-700">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                            Room {groupedPayments[tenantId][0].tenant?.unit?.unit_number}
                          </h3>
                          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {groupedPayments[tenantId][0].tenant?.tenant_name}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatCurrency(groupedPayments[tenantId][0].amount)}
                          </div>
                          <div className={`text-sm font-medium mt-1 ${getStatusColor(groupedPayments[tenantId][0].status)}`}>
                            {groupedPayments[tenantId][0].status.charAt(0).toUpperCase() + groupedPayments[tenantId][0].status.slice(1)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-1 mb-3">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Due: {new Date(groupedPayments[tenantId][0].due_date).toLocaleDateString('en-GB')}
                        </div>
                        {groupedPayments[tenantId][0].payment_date && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Paid: {new Date(groupedPayments[tenantId][0].payment_date).toLocaleDateString('en-GB')}
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center">
                          <div>
                            {groupedPayments[tenantId][0].payment_method && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                Via: {groupedPayments[tenantId][0].payment_method}
                              </div>
                            )}
                            {groupedPayments[tenantId][0].payment_method === 'Mpesa' && groupedPayments[tenantId][0].mpesa_code && (
                              <div className="text-xs text-indigo-500 dark:text-indigo-400">
                                Mpesa: {groupedPayments[tenantId][0].mpesa_code}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(groupedPayments[tenantId][0])}
                              className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(groupedPayments[tenantId][0])}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-center mt-4">
                        <button
                          onClick={() => toggleExpand(tenantId)}
                          className="inline-flex items-center px-3 py-1.5 text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50 rounded-md"
                        >
                          {expandedTenants[tenantId] ? 'Hide Payments' : 'Show All Payments'}
                        </button>
                      </div>
                      {expandedTenants[tenantId] && (
                        <div className="mt-4">
                          {groupedPayments[tenantId].slice(1).map(payment => (
                            <div key={payment.id} className="border-b border-gray-200 dark:border-gray-700">
                              <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                  <div>
                                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                                      Room {payment.tenant?.unit?.unit_number}
                                    </h3>
                                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                      {payment.tenant?.tenant_name}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                      {formatCurrency(payment.amount)}
                                    </div>
                                    <div className={`text-sm font-medium mt-1 ${getStatusColor(payment.status)}`}>
                                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="space-y-1 mb-3">
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    Due: {new Date(payment.due_date).toLocaleDateString('en-GB')}
                                  </div>
                                  {payment.payment_date && (
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      Paid: {new Date(payment.payment_date).toLocaleDateString('en-GB')}
                                    </div>
                                  )}
                                  
                                  <div className="flex justify-between items-center">
                                    <div>
                                      {payment.payment_method && (
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                          Via: {payment.payment_method}
                                        </div>
                                      )}
                                      {payment.payment_method === 'Mpesa' && payment.mpesa_code && (
                                        <div className="text-xs text-indigo-500 dark:text-indigo-400">
                                          Mpesa: {payment.mpesa_code}
                                        </div>
                                      )}
                                    </div>
                                    
                                    <div className="flex space-x-2">
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
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                  No payments found. Add a payment to get started.
                </div>
              )}
            </div>
          </div>

          {/* Payment History Tab */}
          <div className={`${activeTab === 'history' ? 'block' : 'hidden'}`}>
            <PaymentHistory />
          </div>
        </div>
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