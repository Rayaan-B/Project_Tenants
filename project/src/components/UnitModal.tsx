import React from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useStore } from '../lib/store';
import { toast } from 'react-hot-toast';
import type { Property } from '../lib/types';

interface UnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property;
}

export default function UnitModal({ isOpen, onClose, property }: UnitModalProps) {
  const { fetchUnits } = useStore();
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    unitName: '',
    floorPlan: '',
    squareFeet: '',
    rentAmount: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('units')
        .insert({
          property_id: property.id,
          unit_number: formData.unitName,
          floor_plan: formData.floorPlan || null,
          square_feet: formData.squareFeet ? parseInt(formData.squareFeet) : null,
          rent_amount: parseFloat(formData.rentAmount),
          status: 'available'
        });

      if (error) throw error;

      toast.success('Unit added successfully');
      fetchUnits();
      onClose();
      
      // Reset form
      setFormData({
        unitName: '',
        floorPlan: '',
        squareFeet: '',
        rentAmount: ''
      });
    } catch (error) {
      console.error('Error adding unit:', error);
      toast.error(error instanceof Error ? error.message : 'Error adding unit');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Add New Unit to {property.name}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Unit Name</label>
            <input
              type="text"
              required
              value={formData.unitName}
              onChange={(e) => setFormData(prev => ({ ...prev, unitName: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Floor Plan</label>
            <input
              type="text"
              value={formData.floorPlan}
              onChange={(e) => setFormData(prev => ({ ...prev, floorPlan: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Square Feet</label>
            <input
              type="number"
              value={formData.squareFeet}
              onChange={(e) => setFormData(prev => ({ ...prev, squareFeet: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Monthly Rent</label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.rentAmount}
              onChange={(e) => setFormData(prev => ({ ...prev, rentAmount: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
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
              className="px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Unit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}