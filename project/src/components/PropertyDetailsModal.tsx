import React from 'react';
import { X, Home, Edit, Trash2, MoreVertical } from 'lucide-react';
import { Property, Unit } from '../lib/types';
import { useStore } from '../lib/store';
import { toast } from 'react-hot-toast';
import UnitModal from './UnitModal';

interface PropertyDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property;
  onEditProperty?: () => void;
}

const PropertyDetailsModal: React.FC<PropertyDetailsModalProps> = ({
  isOpen,
  onClose,
  property,
  onEditProperty,
}) => {
  const { deleteUnit } = useStore();
  const [showUnitMenu, setShowUnitMenu] = React.useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = React.useState<string | null>(null);
  const [isUnitModalOpen, setIsUnitModalOpen] = React.useState(false);
  const [unitToEdit, setUnitToEdit] = React.useState<Unit | undefined>(undefined);

  if (!isOpen) return null;

  const handleDeleteUnit = async (unitId: string) => {
    try {
      await deleteUnit(unitId);
      toast.success('Unit deleted successfully');
      setConfirmDelete(null);
    } catch (error) {
      toast.error('Failed to delete unit');
      console.error(error);
    }
  };

  const handleEditUnit = (unit: Unit) => {
    setUnitToEdit(unit);
    setIsUnitModalOpen(true);
    setShowUnitMenu(null);
  };

  const handleCloseUnitModal = () => {
    setIsUnitModalOpen(false);
    setUnitToEdit(undefined);
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Property Details</h2>
          <div className="flex items-center space-x-2">
            {onEditProperty && (
              <button
                onClick={onEditProperty}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <Edit className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto p-4 flex-grow">
          <div className="grid grid-cols-1 gap-6">
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Created At</p>
                  <p className="text-gray-900 dark:text-gray-100">
                    {new Date(property.created_at).toLocaleDateString('en-GB')}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Last Updated</p>
                  <p className="text-gray-900 dark:text-gray-100">
                    {new Date(property.updated_at).toLocaleDateString('en-GB')}
                  </p>
                </div>
              </div>
            </div>

            {/* Units Information */}
            <div>
              <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Units</h3>
              <div className="space-y-3 overflow-x-auto">
                {property.units && property.units.length > 0 ? (
                  property.units.map((unit: Unit) => (
                    <div
                      key={unit.id}
                      className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg relative"
                    >
                      <Home className="h-5 w-5 text-gray-400 dark:text-gray-300 mr-3 flex-shrink-0" />
                      <div className="flex-grow min-w-0">
                        <div className="flex justify-between items-start flex-wrap gap-y-1">
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
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {unit.floor_plan}
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          ${unit.rent_amount?.toFixed(2) || 'N/A'} /month
                        </p>
                      </div>
                      
                      {/* Unit Actions */}
                      <div className="relative ml-2">
                        <button 
                          onClick={() => setShowUnitMenu(showUnitMenu === unit.id ? null : unit.id)}
                          className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                          <MoreVertical className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        </button>
                        
                        {showUnitMenu === unit.id && (
                          <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700">
                            <div className="py-1">
                              <button
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                                onClick={() => handleEditUnit(unit)}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Unit
                              </button>
                              <button
                                className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                                onClick={() => {
                                  setConfirmDelete(unit.id);
                                  setShowUnitMenu(null);
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Unit
                              </button>
                            </div>
                          </div>
                        )}
                        
                        {/* Delete Confirmation */}
                        {confirmDelete === unit.id && (
                          <div className="absolute right-0 mt-1 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 p-3 border border-gray-200 dark:border-gray-700">
                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                              Are you sure you want to delete this unit?
                            </p>
                            <div className="flex justify-end space-x-2">
                              <button
                                className="px-3 py-1 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                onClick={() => setConfirmDelete(null)}
                              >
                                Cancel
                              </button>
                              <button
                                className="px-3 py-1 text-xs text-white bg-red-600 hover:bg-red-700 rounded"
                                onClick={() => handleDeleteUnit(unit.id)}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">No units found for this property.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Unit Modal for Editing */}
      {isUnitModalOpen && (
        <UnitModal
          isOpen={isUnitModalOpen}
          onClose={handleCloseUnitModal}
          property={property}
          unit={unitToEdit}
        />
      )}
    </div>
  );
};

export default PropertyDetailsModal;
