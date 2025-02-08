import React from 'react';
import { X, Home } from 'lucide-react';
import { Property, Unit } from '../lib/types';

interface PropertyDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property;
}

const PropertyDetailsModal: React.FC<PropertyDetailsModalProps> = ({
  isOpen,
  onClose,
  property,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Property Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Property Information */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">{property.name}</h3>
            </div>

            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Address</p>
              <p className="text-gray-900 dark:text-gray-100">{property.address}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Location</p>
              <p className="text-gray-900 dark:text-gray-100">
                {property.city}, {property.state} {property.zip_code}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Created At</p>
              <p className="text-gray-900 dark:text-gray-100">
                {new Date(property.created_at).toLocaleDateString()}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Last Updated</p>
              <p className="text-gray-900 dark:text-gray-100">
                {new Date(property.updated_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Units Information */}
          <div>
            <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Units</h3>
            <div className="space-y-3">
              {property.units && property.units.length > 0 ? (
                property.units.map((unit: Unit) => (
                  <div
                    key={unit.id}
                    className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <Home className="h-5 w-5 text-gray-400 dark:text-gray-300 mr-3" />
                    <div className="flex-grow">
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {unit.unit_number}
                        </p>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          unit.status === 'occupied' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100' : 
                          unit.status === 'reserved' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100' : 
                          'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100'
                        }`}>
                          {unit.status ? unit.status.charAt(0).toUpperCase() + unit.status.slice(1) : 'Available'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {unit.floor_plan}
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        ${unit.rent_amount?.toFixed(2) || 'N/A'} /month
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 italic">No units added yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailsModal;
