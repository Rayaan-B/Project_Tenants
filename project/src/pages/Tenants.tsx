import React from 'react';
import { useStore } from '../lib/store';
import { Plus, Edit, Trash2 } from 'lucide-react';
import TenantModal from '../components/TenantModal';
import { Tenant } from '../lib/types';
import { toast } from 'react-hot-toast';
import { formatCurrency } from '../utils/currency';

function Tenants() {
  const { tenants, fetchTenants, deleteTenant, darkMode } = useStore();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedTenant, setSelectedTenant] = React.useState<Tenant | undefined>();

  React.useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  const handleEdit = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setIsModalOpen(true);
  };

  const handleDelete = async (tenant: Tenant) => {
    if (window.confirm('Are you sure you want to delete this tenant?')) {
      try {
        await deleteTenant(tenant.id);
        toast.success('Tenant deleted successfully');
      } catch (error) {
        toast.error('Error deleting tenant');
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
            Last updated: {new Date().toLocaleDateString()}
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

      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} 
        rounded-xl shadow-sm overflow-hidden border`}>
        <div className={`p-4 sm:p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Tenant List
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
              <tr>
                <th className={`px-3 sm:px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                  Name & Details
                </th>
                <th className={`hidden sm:table-cell px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                  Unit
                </th>
                <th className={`hidden sm:table-cell px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                  Lease Period
                </th>
                <th className={`hidden sm:table-cell px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                  Rent Amount
                </th>
                <th className={`px-3 sm:px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider w-20`}>
                  Status
                </th>
                <th className={`px-2 sm:px-6 py-3 text-right text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider w-16`}>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className={`${darkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {tenants.map((tenant) => (
                <tr key={tenant.id} className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors duration-150`}>
                  <td className="px-3 sm:px-6 py-4">
                    <div className="flex items-start">
                      <div className="min-w-0">
                        <div className={`text-sm font-medium truncate ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                          {tenant.tenant_name}
                        </div>
                        <div className={`text-xs sm:text-sm truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {tenant.tenant_email}
                        </div>
                        <div className="sm:hidden mt-1 space-y-0.5">
                          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {tenant.unit?.unit_number}
                          </div>
                          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {formatCurrency(tenant.rent_amount || 0)}
                          </div>
                          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {new Date(tenant.lease_start).toLocaleDateString()} - {new Date(tenant.lease_end).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                      {tenant.unit?.unit_number}
                    </div>
                  </td>
                  <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                      {new Date(tenant.lease_start).toLocaleDateString()} -
                      {new Date(tenant.lease_end).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                      {formatCurrency(tenant.rent_amount || 0)}
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                      ${new Date(tenant.lease_end) < new Date()
                        ? darkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800'
                        : darkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'}`}
                    >
                      {new Date(tenant.lease_end) < new Date() ? 'Expired' : 'Active'}
                    </span>
                  </td>
                  <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(tenant)}
                        className={`${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-900'}`}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(tenant)}
                        className={`${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-900'}`}
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