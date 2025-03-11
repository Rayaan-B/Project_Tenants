import React from 'react';
import { useStore } from '../lib/store';
import { Plus, Edit, Trash2 } from 'lucide-react';
import TenantModal from '../components/TenantModal';
import { Tenant } from '../lib/types';
import { toast } from 'react-hot-toast';
import { formatCurrency } from '../utils/currency';

function getDaySuffix(day: number): string {
  if (day >= 11 && day <= 13) {
    return 'th';
  }
  switch (day % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
}

function getNextPaymentDate(paymentDueDay: number): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const nextPaymentDate = new Date(year, month, paymentDueDay);
  if (nextPaymentDate < today) {
    nextPaymentDate.setMonth(month + 1);
  }
  return nextPaymentDate.toLocaleDateString('en-GB');
}

function Tenants() {
  const { tenants, fetchTenants, deleteTenant, darkMode } = useStore();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedTenant, setSelectedTenant] = React.useState<Tenant | undefined>();
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchTenants();
      setIsLoading(false);
    };
    
    loadData();
    
    // Set up a refresh interval to periodically check for new data
    const refreshInterval = setInterval(() => {
      fetchTenants();
    }, 30000); // Refresh every 30 seconds
    
    return () => {
      clearInterval(refreshInterval);
    };
  }, [fetchTenants]);

  const handleEdit = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setIsModalOpen(true);
  };

  const handleDelete = async (tenant: Tenant) => {
    if (window.confirm('Are you sure you want to delete this tenant?')) {
      try {
        setIsLoading(true);
        await deleteTenant(tenant.id);
        // Force a refresh of the tenants list
        await fetchTenants();
        setIsLoading(false);
        toast.success('Tenant deleted successfully');
      } catch (error) {
        setIsLoading(false);
        toast.error('Error deleting tenant');
        console.error('Error deleting tenant:', error);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTenant(undefined);
  };

  return (
    <div className={`space-y-8 p-4 sm:p-6 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-8">
        <div>
          <h1 className={`text-2xl sm:text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Tenants Overview
          </h1>
          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
            Last updated: {new Date().toLocaleDateString('en-GB')}
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Tenant
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Total Tenants Card */}
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} 
          rounded-xl shadow-sm p-6 transition-all duration-200 hover:shadow-md border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Total Tenants
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mt-1`}>
                {tenants.length}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Active Leases Card */}
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} 
          rounded-xl shadow-sm p-6 transition-all duration-200 hover:shadow-md border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Active Leases
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mt-1`}>
                {tenants.filter(t => new Date(t.lease_end) > new Date()).length}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Rent Card */}
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} 
          rounded-xl shadow-sm p-6 transition-all duration-200 hover:shadow-md border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Total Monthly Rent
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mt-1`}>
                {formatCurrency(tenants.reduce((sum, tenant) => sum + (tenant.rent_amount || 0), 0))}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Tenant List */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} 
        rounded-xl shadow-sm overflow-hidden border`}>
        <div className={`p-4 sm:p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Tenant List
          </h2>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {isLoading ? (
            <div className="p-8 text-center">
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Loading tenants...
              </p>
            </div>
          ) : tenants.length === 0 ? (
            <div className="p-8 text-center">
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                No tenants found. Add a tenant to get started.
              </p>
            </div>
          ) : (
            tenants.map((tenant) => (
              <div key={tenant.id} className={`${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {tenant.tenant_name}
                    </h3>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                      ${new Date(tenant.lease_end) < new Date()
                        ? darkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800'
                        : darkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'}`}
                    >
                      {new Date(tenant.lease_end) < new Date() ? 'Expired' : 'Active'}
                    </span>
                  </div>
                  
                  <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-3`}>
                    {tenant.tenant_phone || 'No phone number'}
                  </div>
                  
                  <div className="flex flex-row gap-3 mb-3">
                    <div className={`w-1/2 p-3 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                      <div className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>
                        Room
                      </div>
                      <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {tenant.unit?.unit_number || 'No unit assigned'}
                      </div>
                    </div>
                    
                    <div className={`w-1/2 p-3 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                      <div className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>
                        Rent
                      </div>
                      <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(tenant.rent_amount || 0)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-row gap-3 mb-3">
                    <div className={`w-1/2 p-3 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                      <div className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>
                        Payment Due Date
                      </div>
                      <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {tenant.payment_due_day ? `${tenant.payment_due_day}${getDaySuffix(tenant.payment_due_day)} of each month` : 'Not set'}
                      </div>
                    </div>
                    
                    <div className={`w-1/2 p-3 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                      <div className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>
                        Next Payment
                      </div>
                      <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {tenant.payment_due_day ? getNextPaymentDate(tenant.payment_due_day) : 'Not set'}
                      </div>
                    </div>
                  </div>
                  
                  <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-100'} mb-3`}>
                    <div className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>
                      Lease Period
                    </div>
                    <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {new Date(tenant.lease_start).toLocaleDateString('en-GB')} - {new Date(tenant.lease_end).toLocaleDateString('en-GB')}
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleEdit(tenant)}
                      className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(tenant)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <TenantModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        tenant={selectedTenant}
      />
    </div>
  );
}

export default Tenants;