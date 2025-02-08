import React from 'react';
import { useStore } from '../lib/store';
import { Plus, Building2, Home } from 'lucide-react';
import PropertyModal from '../components/PropertyModal';
import UnitModal from '../components/UnitModal';
import PropertyDetailsModal from '../components/PropertyDetailsModal';
import type { Property } from '../lib/types';

function Properties() {
  const { properties, fetchProperties } = useStore();
  const [isPropertyModalOpen, setIsPropertyModalOpen] = React.useState(false);
  const [isUnitModalOpen, setIsUnitModalOpen] = React.useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = React.useState(false);
  const [selectedProperty, setSelectedProperty] = React.useState<Property | null>(null);

  React.useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const handleAddUnit = (property: Property) => {
    setSelectedProperty(property);
    setIsUnitModalOpen(true);
  };

  const handleViewDetails = (property: Property) => {
    setSelectedProperty(property);
    setIsDetailsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
        <button
          onClick={() => setIsPropertyModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Property
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {properties.map((property) => (
          <div
            key={property.id}
            className="bg-white overflow-hidden shadow-sm rounded-lg hover:shadow-md transition-shadow duration-200"
          >
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Building2 className="h-8 w-8 text-gray-400" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {property.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {property.address}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-500">
                  {property.city}, {property.state} {property.zip_code}
                </p>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => handleAddUnit(property)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Add Unit
                </button>
                <button
                  onClick={() => handleViewDetails(property)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <PropertyModal
        isOpen={isPropertyModalOpen}
        onClose={() => setIsPropertyModalOpen(false)}
      />

      {selectedProperty && (
        <>
          <UnitModal
            isOpen={isUnitModalOpen}
            onClose={() => {
              setIsUnitModalOpen(false);
              setSelectedProperty(null);
            }}
            property={selectedProperty}
          />
          <PropertyDetailsModal
            isOpen={isDetailsModalOpen}
            onClose={() => {
              setIsDetailsModalOpen(false);
              setSelectedProperty(null);
            }}
            property={selectedProperty}
          />
        </>
      )}
    </div>
  );
}

export default Properties;