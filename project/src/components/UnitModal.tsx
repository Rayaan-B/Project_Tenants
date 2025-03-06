import React from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useStore } from '../lib/store';
import { toast } from 'react-hot-toast';
import type { Property, Unit } from '../lib/types';

interface UnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property;
  unit?: Unit;
}

export default function UnitModal({ isOpen, onClose, property, unit }: UnitModalProps) {
  const { fetchUnits, updateUnit } = useStore();
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    unitName: '',
    floorPlan: '',
    squareFeet: '',
    rentAmount: '',
    status: 'available'
  });

  // Load unit data when editing
  React.useEffect(() => {
    if (unit) {
      setFormData({
        unitName: unit.unit_number || '',
        floorPlan: unit.floor_plan || '',
        squareFeet: unit.square_feet ? unit.square_feet.toString() : '',
        rentAmount: unit.rent_amount ? unit.rent_amount.toString() : '',
        status: unit.status || 'available'
      });
    } else {
      // Reset form for new unit
      setFormData({
        unitName: '',
        floorPlan: '',
        squareFeet: '',
        rentAmount: '',
        status: 'available'
      });
    }
  }, [unit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (unit) {
        // Update existing unit
        await updateUnit(unit.id, {
          unit_number: formData.unitName,
          floor_plan: formData.floorPlan || null,
          square_feet: formData.squareFeet ? parseInt(formData.squareFeet) : null,
          rent_amount: parseFloat(formData.rentAmount),
          status: formData.status
        });
        toast.success('Unit updated successfully');
      } else {
        // Create new unit
        const { error } = await supabase
          .from('units')
          .insert({
            property_id: property.id,
            unit_number: formData.unitName,
            floor_plan: formData.floorPlan || null,
            square_feet: formData.squareFeet ? parseInt(formData.squareFeet) : null,
            rent_amount: parseFloat(formData.rentAmount),
            status: formData.status
          });

        if (error) throw error;
        toast.success('Unit added successfully');
      }

      fetchUnits();
      onClose();
    } catch (error) {
      console.error('Error saving unit:', error);
      toast.error(error instanceof Error ? error.message : 'Error saving unit');
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
            {unit ? 'Edit Unit' : `Add New Unit to ${property.name}`}
          </h2>
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Rent Amount</label>
            <input
              type="number"
              required
              step="0.01"
              value={formData.rentAmount}
              onChange={(e) => setFormData(prev => ({ ...prev, rentAmount: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
            <select
              required
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            >
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="reserved">Reserved</option>
              <option value="maintenance">Maintenance</option>
            </select>
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
              {loading ? (unit ? 'Updating...' : 'Adding...') : (unit ? 'Update Unit' : 'Add Unit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}