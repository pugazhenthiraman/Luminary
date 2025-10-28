import React, { useState, useEffect } from 'react';
import { 
  FaCoins, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaTimes,
  FaCheck,
  FaPause,
  FaPlay,
  FaDollarSign,
  FaStar,
  FaCheckCircle
} from 'react-icons/fa';
import { showSuccessToast, showErrorToast } from '../../components/Toast';
import creditsApi from '../../api/credits';

interface CreditPackage {
  id: string;
  name: string;
  description: string;
  credits: number;
  price: number;
  currency: string;
  isActive: boolean;
  isPopular: boolean;
  bonusCredits: number;
  createdAt: string;
  updatedAt: string;
}

const CreditPackages: React.FC = () => {
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showInactive, setShowInactive] = useState(true); // Show inactive packages
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    credits: '',
    price: '',
    currency: 'USD',
    isActive: true,
    isPopular: false,
    bonusCredits: '',
  });

  // Determine plan ID for styling
  const getPlanId = (pkg: CreditPackage): 'basic' | 'medium' | 'family' => {
    const name = pkg.name.toLowerCase();
    if (name.includes('basic')) return 'basic';
    if (name.includes('family')) return 'family';
    return 'medium';
  };

  const getFeatures = (pkg: CreditPackage) => {
    const planId = getPlanId(pkg);
    return [
      `${Number(pkg.credits)} credits included`,
      'Use across any course',
      'Instant wallet top-up',
      planId === 'basic' ? 'One-time access' : 
      planId === 'medium' ? '2-3 classes' : 
      '5-6+ classes'
    ];
  };

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    setIsLoading(true);
    try {
      const response = await creditsApi.getPackages(undefined); // Get all packages, not just active
      setPackages(response?.packages || []);
    } catch (error) {
      console.error('Failed to load credit packages:', error);
      showErrorToast('Failed to load credit packages');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNew = () => {
    setSelectedPackage(null);
    setFormData({
      name: '',
      description: '',
      credits: '',
      price: '',
      currency: 'USD',
      isActive: true,
      isPopular: false,
      bonusCredits: '',
    });
    setShowModal(true);
  };

  const handleEdit = (pkg: CreditPackage) => {
    setSelectedPackage(pkg);
    setFormData({
      name: pkg.name,
      description: pkg.description,
      credits: String(pkg.credits),
      price: String(pkg.price),
      currency: pkg.currency,
      isActive: pkg.isActive,
      isPopular: pkg.isPopular,
      bonusCredits: String(pkg.bonusCredits),
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this credit package?')) {
      return;
    }

    try {
      await creditsApi.deletePackage(id);
      showSuccessToast('Credit package deleted successfully');
      loadPackages();
    } catch (error: any) {
      showErrorToast(error?.response?.data?.message || 'Failed to delete package');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Convert string values to numbers for API
      const submitData = {
        ...formData,
        credits: parseFloat(formData.credits) || 0,
        price: parseFloat(formData.price) || 0,
        bonusCredits: parseFloat(formData.bonusCredits) || 0,
      };

      if (selectedPackage) {
        // Update existing
        await creditsApi.updatePackage(selectedPackage.id, submitData);
        showSuccessToast('Credit package updated successfully');
      } else {
        // Create new
        await creditsApi.createPackage(submitData);
        showSuccessToast('Credit package created successfully');
      }
      setShowModal(false);
      loadPackages();
    } catch (error: any) {
      showErrorToast(error?.response?.data?.message || 'Failed to save package');
    }
  };

  const toggleActive = async (pkg: CreditPackage) => {
    try {
      await creditsApi.updatePackage(pkg.id, { isActive: !pkg.isActive });
      showSuccessToast(`Package ${pkg.isActive ? 'deactivated' : 'activated'} successfully`);
      loadPackages();
    } catch (error: any) {
      showErrorToast(error?.response?.data?.message || 'Failed to update package');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading credit packages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Credit Packages</h2>
          <p className="text-gray-600">Manage credit packages for parents to purchase</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowInactive(!showInactive)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              showInactive 
                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {showInactive ? (
              <>
                <FaCheckCircle /> Showing All
              </>
            ) : (
              <>
                <FaTimes /> Hide Inactive
              </>
            )}
          </button>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <FaPlus /> Add New Package
          </button>
        </div>
      </div>

      {/* Packages List - Matching WalletPlansModal Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages
          .filter(pkg => showInactive || pkg.isActive) // Filter based on showInactive
          .map((pkg) => {
            const planId = getPlanId(pkg);
            const features = getFeatures(pkg);
            return (
              <div
                key={pkg.id}
                className={`relative rounded-2xl border shadow-lg hover:shadow-xl transition-all overflow-hidden ${
                  !pkg.isActive ? 'opacity-60 border-red-300' : ''
                }`}
              >
                {!pkg.isActive && (
                  <span className="absolute top-3 left-3 z-10 text-xs font-semibold bg-red-500 text-white px-2 py-1 rounded-full">
                    INACTIVE
                  </span>
                )}
                {pkg.isPopular && (
                  <span className={`absolute top-3 ${!pkg.isActive ? 'right-3' : 'right-12'} z-10 text-xs font-semibold bg-blue-600 text-white px-2 py-1 rounded-full`}>
                    Popular
                  </span>
                )}
              <div 
                className={`h-28 bg-gradient-to-br ${
                  planId === 'basic' ? 'from-violet-500 to-fuchsia-600' : 
                  planId === 'medium' ? 'from-purple-500 to-violet-600' : 
                  'from-rose-500 to-pink-600'
                }`}
              ></div>
              <div className="-mt-8 pb-6 px-5">
                <div className="w-24 h-24 mx-auto rounded-full bg-white shadow-lg border flex items-center justify-center text-2xl font-extrabold text-gray-900">
                  ${pkg.price}
                </div>
                <h4 className="mt-3 text-xl font-bold text-center">{pkg.name}</h4>
                <p className="text-xs text-gray-500 text-center">{pkg.description}</p>
                
                {/* Features */}
                <ul className="mt-4 space-y-2 text-sm">
                  {features.map((feature, idx) => (
                    <li key={idx} className="flex gap-2 items-start">
                      <FaCheckCircle className="text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Admin Actions */}
                <div className="mt-5 space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-600 px-2">
                    <span>Status: </span>
                    <span className={`font-semibold ${pkg.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                      {pkg.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleEdit(pkg)}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                    >
                      <FaEdit /> Edit
                    </button>
                    <button
                      onClick={() => toggleActive(pkg)}
                      className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                        pkg.isActive
                          ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                          : 'bg-green-50 text-green-700 hover:bg-green-100'
                      }`}
                    >
                      {pkg.isActive ? <FaPause /> : <FaPlay />}
                      {pkg.isActive ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                  <button
                    onClick={() => handleDelete(pkg.id)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm"
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* No packages */}
      {packages.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-300">
          <FaCoins className="text-6xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Credit Packages</h3>
          <p className="text-gray-600 mb-4">Create your first credit package to get started</p>
          <button
            onClick={handleAddNew}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <FaPlus /> Create Package
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header - Matching WalletPlansModal */}
            <div className="relative h-28 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600">
              <button
                type="button"
                className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white pointer-events-auto"
                onClick={() => setShowModal(false)}
                aria-label="Close"
                title="Close"
              >
                <FaTimes />
              </button>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center text-white">
                  <h3 className="text-2xl sm:text-3xl font-extrabold">
                    {selectedPackage ? 'Edit Credit Package' : 'Create Credit Package'}
                  </h3>
                  <p className="text-white/90 text-sm mt-1">
                    {selectedPackage ? 'Update package details' : 'Add a new credit package for parents'}
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="overflow-y-auto">
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Package Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="e.g., Starter Package"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Describe this package..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Credits *
                  </label>
                  <div className="relative">
                    <FaCoins className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      required
                      min="1"
                      step="0.01"
                      value={formData.credits}
                      onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bonus Credits
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.bonusCredits}
                    onChange={(e) => setFormData({ ...formData, bonusCredits: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price ($) *
                  </label>
                  <div className="relative">
                    <FaDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Currency
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="USD">USD</option>
                    {/* <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="CAD">CAD</option> */}
                  </select>
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Active</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPopular}
                      onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      <FaStar className="inline text-yellow-400 mr-1" /> Popular
                    </span>
                  </label>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border-2 border-indigo-200">
                <h3 className="font-semibold text-gray-900 mb-2">Package Summary</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Base Credits:</span>
                    <span className="font-semibold">{formData.credits || '0'}</span>
                  </div>
                  {parseFloat(formData.bonusCredits) > 0 && (
                    <div className="flex justify-between text-yellow-600">
                      <span>Bonus Credits:</span>
                      <span className="font-semibold">+{formData.bonusCredits}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-indigo-600 font-bold">
                    <span>Total Credits:</span>
                    <span>{parseFloat(formData.credits) + parseFloat(formData.bonusCredits) || 0}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-indigo-200">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-bold text-gray-900">
                      ${(parseFloat(formData.price) || 0).toFixed(2)} {formData.currency}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <FaCheck /> {selectedPackage ? 'Update Package' : 'Create Package'}
                </button>
              </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreditPackages;
