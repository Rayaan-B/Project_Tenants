import React from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useStore } from '../lib/store';
import { toast } from 'react-hot-toast';
import type { Payment, Tenant } from '../lib/types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment?: Payment;
}

export default function PaymentModal({ isOpen, onClose, payment }: PaymentModalProps) {
  const { tenants, fetchPayments, fetchTenants } = useStore();
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    tenantId: '',
    amount: '',
    dueDate: '',
    paymentDate: '',
    paymentMethod: '',
    notes: '',
    paymentReminder: false
  });

  React.useEffect(() => {
    if (isOpen) {
      fetchTenants().then(() => {
        console.log('Tenants loaded:', tenants);
      });
    }
  }, [isOpen, fetchTenants]);

  // Initialize form data when editing
  React.useEffect(() => {
    if (payment) {
      setFormData({
        tenantId: payment.tenant_id,
        amount: payment.amount.toString(),
        dueDate: payment.due_date,
        paymentDate: payment.payment_date || '',
        paymentMethod: payment.payment_method || '',
        notes: payment.notes || '',
        paymentReminder: false
      });
    } else {
      setFormData({
        tenantId: '',
        amount: '',
        dueDate: '',
        paymentDate: '',
        paymentMethod: '',
        notes: '',
        paymentReminder: false
      });
    }
  }, [payment]);

  const sortedTenants = React.useMemo(() => {
    return [...tenants].sort((a, b) => {
      const unitA = a.unit?.unit_number || '';
      const unitB = b.unit?.unit_number || '';
      return unitA.localeCompare(unitB);
    });
  }, [tenants]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (payment) {
        // Update existing payment
        const { error } = await supabase
          .from('payments')
          .update({
            tenant_id: formData.tenantId,
            amount: parseFloat(formData.amount),
            due_date: formData.dueDate,
            payment_date: formData.paymentDate || null,
            payment_method: formData.paymentMethod || null,
            notes: formData.notes || null,
            status: formData.paymentDate ? 'paid' : 'pending'
          })
          .eq('id', payment.id);

        if (error) throw error;
        toast.success('Payment updated successfully');
      } else {
        // Create new payment
        const { error } = await supabase
          .from('payments')
          .insert({
            tenant_id: formData.tenantId,
            amount: parseFloat(formData.amount),
            due_date: formData.dueDate,
            payment_date: formData.paymentDate || null,
            payment_method: formData.paymentMethod || null,
            notes: formData.notes || null,
            status: formData.paymentDate ? 'paid' : 'pending'
          });

        if (error) throw error;
        toast.success('Payment recorded successfully');
      }

      fetchPayments();
      onClose();
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error instanceof Error ? error.message : 'Error recording payment');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="animate-in fade-in zoom-in-95 bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-lg shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {payment ? 'Edit Payment' : 'Record Payment'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tenant</label>
            <select
              required
              value={formData.tenantId}
              onChange={(e) => setFormData(prev => ({ ...prev, tenantId: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            >
              <option value="">Select a tenant</option>
              {sortedTenants.length === 0 ? (
                <option value="" disabled>Loading tenants...</option>
              ) : (
                sortedTenants.map((tenant: Tenant) => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.tenant_name} {tenant.unit?.unit_number ? `(Unit ${tenant.unit.unit_number})` : ''}
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Due Date</label>
            <input
              type="date"
              required
              value={formData.dueDate}
              onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Payment Date</label>
            <input
              type="date"
              value={formData.paymentDate}
              onChange={(e) => setFormData(prev => ({ ...prev, paymentDate: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Payment Method</label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            >
              <option value="">Select a method</option>
              <option value="Mpesa">Mpesa</option>
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
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
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Saving...' : payment ? 'Update Payment' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}