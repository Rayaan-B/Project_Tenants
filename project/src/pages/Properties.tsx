import React from 'react';
import { useStore } from '../lib/store';
import { Plus, Building2, Home, Percent } from 'lucide-react';
import PropertyModal from '../components/PropertyModal';
import UnitModal from '../components/UnitModal';
import PropertyDetailsModal from '../components/PropertyDetailsModal';
import { formatCurrency } from '../utils/currency';
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

  const calculateOccupancyRate = () => {
    const totalUnits = properties.reduce((sum, p) => sum + (p.units?.length || 0), 0);
    const occupiedUnits = properties.reduce((sum, p) => 
      sum + (p.units?.filter(u => u.tenant_id)?.length || 0), 0);
    return totalUnits ? `${Math.round((occupiedUnits / totalUnits) * 100)}%` : '0%';
  };

  return (
    <div className="space-y-8 p-4 sm:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-8">
        <div>
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-white">Properties Overview</h1>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Last updated: {new Date().toLocaleDateString()}
          </div>
        </div>
        <button
          onClick={() => setIsPropertyModalOpen(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Property
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Total Properties Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-all duration-200 hover:shadow-md border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Total Properties</div>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {properties.length}
              </div>
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Total Units Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-all duration-200 hover:shadow-md border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Total Units</div>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {properties.reduce((sum, p) => sum + (p.units?.length || 0), 0)}
              </div>
              <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <Home className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Occupancy Rate Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-all duration-200 hover:shadow-md border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Occupancy Rate</div>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {calculateOccupancyRate()}
              </div>
              <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <Percent className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Property List</h2>
        </div>
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {properties.map((property) => (
              <div
                key={property.id}
                className="bg-white dark:bg-gray-800 overflow-hidden rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200"
              >
                <div className="p-4 sm:p-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <Building2 className="h-6 sm:h-8 w-6 sm:w-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                      <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white truncate">
                        {property.name}
                      </h3>
                      <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                        {property.address}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                        {property.city}, {property.state} {property.zip_code}
                      </p>
                      <div className="mt-2 flex items-center flex-wrap gap-y-1">
                        <div className="flex items-center">
                          <Home className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-1" />
                          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                            {property.units?.length || 0} Units
                          </span>
                        </div>
                        <span className="mx-2 text-gray-300 dark:text-gray-600">•</span>
                        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                          {property.units?.filter(u => u.tenant_id)?.length || 0} Occupied
                        </span>
                      </div>
                      <div className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(property.expected_rent || 0)}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-2 sm:justify-end sm:space-x-3">
                    <button
                      onClick={() => handleAddUnit(property)}
                      className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                    >
                      <Home className="h-4 w-4 mr-2" />
                      Add Unit
                    </button>
                    <button
                      onClick={() => handleViewDetails(property)}
                      className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Total Expected Rent Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-all duration-200 hover:shadow-md border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Total Expected Rent</div>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(properties.reduce((sum, property) => sum + (property.expected_rent || 0), 0))}
              </div>
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
        </div>
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