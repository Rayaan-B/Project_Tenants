import React from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useStore } from '../lib/store';
import { toast } from 'react-hot-toast';
import type { Unit, Tenant } from '../lib/types';

interface TenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant?: Tenant;
}

export default function TenantModal({ isOpen, onClose, tenant }: TenantModalProps) {
  const { units, fetchTenants, updateTenant, fetchUnits } = useStore();
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    email: '',
    fullName: '',
    phone: '',
    unitId: '',
    leaseStart: '',
    leaseEnd: '',
    rentAmount: '',
    securityDeposit: '',
    paymentDueDay: '1'
  });

  // Load tenant data when editing
  React.useEffect(() => {
    if (tenant) {
      setFormData({
        email: tenant.tenant_email || '',
        fullName: tenant.tenant_name || '',
        phone: tenant.tenant_phone || '',
        unitId: tenant.unit_id,
        leaseStart: tenant.lease_start,
        leaseEnd: tenant.lease_end,
        rentAmount: tenant.rent_amount.toString(),
        securityDeposit: tenant.security_deposit?.toString() || '',
        paymentDueDay: tenant.payment_due_day.toString()
      });
    }
  }, [tenant]);

  React.useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const tenantData = {
        unit_id: formData.unitId,
        lease_start: formData.leaseStart,
        lease_end: formData.leaseEnd,
        rent_amount: parseFloat(formData.rentAmount),
        security_deposit: formData.securityDeposit ? parseFloat(formData.securityDeposit) : null,
        payment_due_day: parseInt(formData.paymentDueDay),
        tenant_name: formData.fullName,
        tenant_email: formData.email,
        tenant_phone: formData.phone
      };

      if (tenant) {
        // Update existing tenant
        await updateTenant(tenant.id, tenantData);
        toast.success('Tenant updated successfully');
      } else {
        // Create new tenant
        const { error: tenantError } = await supabase
          .from('tenants')
          .insert(tenantData);

        if (tenantError) {
          throw new Error('Error creating tenant: ' + tenantError.message);
        }

        // Update unit status to occupied
        const { error: unitError } = await supabase
          .from('units')
          .update({ status: 'occupied' })
          .eq('id', formData.unitId);

        if (unitError) {
          throw new Error('Error updating unit status: ' + unitError.message);
        }

        toast.success('Tenant added successfully');
      }

      fetchTenants();
      fetchUnits(); // Refresh units to update status
      onClose();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : 'Error saving tenant');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {tenant ? 'Edit Tenant' : 'Add New Tenant'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Unit</label>
            <select
              required
              value={formData.unitId}
              onChange={(e) => setFormData(prev => ({ ...prev, unitId: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            >
              <option value="">Select a unit</option>
              {units.map((unit: Unit) => (
                <option key={unit.id} value={unit.id}>
                  Unit {unit.unit_number} - {unit.property?.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Lease Start Date</label>
            <input
              type="date"
              required
              value={formData.leaseStart}
              onChange={(e) => setFormData(prev => ({ ...prev, leaseStart: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Lease End Date</label>
            <input
              type="date"
              required
              value={formData.leaseEnd}
              onChange={(e) => setFormData(prev => ({ ...prev, leaseEnd: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Rent Amount</label>
            <input
              type="number"
              required
              value={formData.rentAmount}
              onChange={(e) => setFormData(prev => ({ ...prev, rentAmount: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Security Deposit</label>
            <input
              type="number"
              value={formData.securityDeposit}
              onChange={(e) => setFormData(prev => ({ ...prev, securityDeposit: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Payment Due Day</label>
            <input
              type="number"
              required
              min="1"
              max="31"
              value={formData.paymentDueDay}
              onChange={(e) => setFormData(prev => ({ ...prev, paymentDueDay: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? (tenant ? 'Updating...' : 'Adding...') : (tenant ? 'Update Tenant' : 'Add Tenant')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}