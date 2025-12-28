import React, { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaChevronDown, FaTimes, FaSearch } from 'react-icons/fa';

interface LocationSelectorProps {
  zipcode?: string;
  city?: string;
  state?: string;
  onLocationChange: (location: { zipcode?: string; city?: string; state?: string }) => void;
  onRadiusChange?: (radius: number) => void;
  defaultRadius?: number;
}

const DALLAS_AREAS = [
  { zipcode: '75201', area: 'Downtown Dallas', city: 'Dallas', state: 'TX' },
  { zipcode: '75202', area: 'Downtown Dallas', city: 'Dallas', state: 'TX' },
  { zipcode: '75204', area: 'Uptown', city: 'Dallas', state: 'TX' },
  { zipcode: '75205', area: 'Highland Park', city: 'Dallas', state: 'TX' },
  { zipcode: '75206', area: 'Lakewood', city: 'Dallas', state: 'TX' },
  { zipcode: '75208', area: 'Bishop Arts', city: 'Dallas', state: 'TX' },
  { zipcode: '75209', area: 'Preston Hollow', city: 'Dallas', state: 'TX' },
  { zipcode: '75214', area: 'Lake Highlands', city: 'Dallas', state: 'TX' },
  { zipcode: '75219', area: 'Uptown', city: 'Dallas', state: 'TX' },
  { zipcode: '75220', area: 'Preston Hollow', city: 'Dallas', state: 'TX' },
  { zipcode: '75225', area: 'Preston Center', city: 'Dallas', state: 'TX' },
  { zipcode: '75226', area: 'Deep Ellum', city: 'Dallas', state: 'TX' },
  { zipcode: '75023', area: 'Plano', city: 'Plano', state: 'TX' },
  { zipcode: '75024', area: 'Plano', city: 'Plano', state: 'TX' },
  { zipcode: '75025', area: 'Plano', city: 'Plano', state: 'TX' },
  { zipcode: '75033', area: 'Frisco', city: 'Frisco', state: 'TX' },
  { zipcode: '75034', area: 'Frisco', city: 'Frisco', state: 'TX' },
  { zipcode: '75035', area: 'Frisco', city: 'Frisco', state: 'TX' },
  { zipcode: '75038', area: 'Irving', city: 'Irving', state: 'TX' },
  { zipcode: '75039', area: 'Irving', city: 'Irving', state: 'TX' },
  { zipcode: '75063', area: 'Irving', city: 'Irving', state: 'TX' },
];

const RADIUS_OPTIONS = [5, 10, 15, 20, 25, -1]; // -1 represents "> 25 miles" (show all courses)

const LocationSelector: React.FC<LocationSelectorProps> = ({
  zipcode: initialZipcode,
  city: initialCity,
  state: initialState,
  onLocationChange,
  onRadiusChange,
  defaultRadius = 10,
}) => {
  const [zipcode, setZipcode] = useState(initialZipcode || '');
  const [city, setCity] = useState(initialCity || '');
  const [state, setState] = useState(initialState || 'TX');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showRadiusDropdown, setShowRadiusDropdown] = useState(false);
  const [radius, setRadius] = useState(defaultRadius);
  const [searchTerm, setSearchTerm] = useState('');

  // Load from localStorage on mount - prioritize localStorage over props
  useEffect(() => {
    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) {
      try {
        const location = JSON.parse(savedLocation);
        if (location.zipcode) {
          setZipcode(location.zipcode);
          setCity(location.city || '');
          setState(location.state || 'TX');
        }
      } catch (e) {
        console.error('Error loading saved location:', e);
      }
    }

    const savedRadius = localStorage.getItem('searchRadius');
    if (savedRadius) {
      const radiusValue = parseInt(savedRadius, 10);
      // Accept -1 for "> 25 miles" or valid numeric radius
      if (!isNaN(radiusValue) && (RADIUS_OPTIONS.includes(radiusValue) || radiusValue === -1)) {
        setRadius(radiusValue);
        // Notify parent of the actual saved radius
        if (onRadiusChange) {
          onRadiusChange(radiusValue);
        }
      }
    }
    // Don't use defaultRadius if localStorage has a value - always prioritize user's saved choice
  }, []);

  // Save to localStorage when location changes
  useEffect(() => {
    if (zipcode) {
      const locationData = { zipcode, city, state };
      localStorage.setItem('userLocation', JSON.stringify(locationData));
      onLocationChange(locationData);
      // Dispatch custom event to notify other components
      window.dispatchEvent(new Event('locationChanged'));
    }
  }, [zipcode, city, state]);

  // Save radius to localStorage and dispatch event when radius changes
  useEffect(() => {
    // Check for valid radius (including -1 for "> 25 miles")
    if (radius !== null && radius !== undefined && !isNaN(radius)) {
      localStorage.setItem('searchRadius', radius.toString());
      if (onRadiusChange) {
        onRadiusChange(radius);
      }
      // Dispatch locationChanged event when radius changes to trigger refetch
      // This ensures that when radius changes, all components listening to location changes will refetch
      window.dispatchEvent(new Event('locationChanged'));
    }
  }, [radius]);

  const filteredAreas = DALLAS_AREAS.filter(
    (area) =>
      area.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
      area.zipcode.includes(searchTerm) ||
      area.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLocationSelect = (selectedArea: typeof DALLAS_AREAS[0]) => {
    setZipcode(selectedArea.zipcode);
    setCity(selectedArea.city);
    setState(selectedArea.state);
    setShowLocationDropdown(false);
    setSearchTerm('');
  };

  const handleManualZipcode = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 5);
    setZipcode(value);
    
    // Try to find city/state from zipcode
    const area = DALLAS_AREAS.find((a) => a.zipcode === value);
    if (area) {
      setCity(area.city);
      setState(area.state);
    }
  };

  const handleRadiusSelect = (selectedRadius: number) => {
    setRadius(selectedRadius);
    setShowRadiusDropdown(false);
  };

  const currentLocationDisplay = zipcode
    ? `${city ? `${city}, ` : ''}${state} ${zipcode}`
    : 'Set location';

  const currentArea = DALLAS_AREAS.find((a) => a.zipcode === zipcode);

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Location Selector */}
      <div className="flex-1 min-w-[200px]">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <FaMapMarkerAlt className="inline mr-1 text-red-500" />
          Location
        </label>
        <div className="relative">
          <div
            className="flex items-center justify-between px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors bg-white"
            onClick={() => setShowLocationDropdown(!showLocationDropdown)}
          >
            <span className={zipcode ? 'text-gray-900' : 'text-gray-500'}>
              {currentLocationDisplay}
            </span>
            <FaChevronDown
              className={`text-gray-400 transition-transform ${showLocationDropdown ? 'rotate-180' : ''}`}
            />
          </div>

          {showLocationDropdown && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
              {/* Search Input */}
              <div className="p-3 border-b border-gray-200">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search area or zipcode..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>

              {/* Manual Zipcode Input */}
              <div className="p-3 border-b border-gray-200">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Or enter zipcode:
                </label>
                <input
                  type="text"
                  placeholder="75201"
                  value={zipcode}
                  onChange={handleManualZipcode}
                  maxLength={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {/* Areas List */}
              <div className="max-h-48 overflow-y-auto">
                {filteredAreas.length > 0 ? (
                  filteredAreas.map((area) => (
                    <div
                      key={area.zipcode}
                      className={`px-4 py-3 cursor-pointer hover:bg-blue-50 transition-colors ${
                        zipcode === area.zipcode ? 'bg-blue-100' : ''
                      }`}
                      onClick={() => handleLocationSelect(area)}
                    >
                      <div className="font-medium text-gray-900">{area.area}</div>
                      <div className="text-sm text-gray-600">
                        {area.city}, {area.state} {area.zipcode}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-3 text-gray-500 text-center">
                    No areas found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Radius Selector */}
      <div className="min-w-[150px]">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search Radius
        </label>
        <div className="relative">
          <div
            className="flex items-center justify-between px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors bg-white"
            onClick={() => setShowRadiusDropdown(!showRadiusDropdown)}
          >
            <span className="text-gray-900">
              {radius === -1 ? '> 25 miles' : `${radius} miles`}
            </span>
            <FaChevronDown
              className={`text-gray-400 transition-transform ${showRadiusDropdown ? 'rotate-180' : ''}`}
            />
          </div>

          {showRadiusDropdown && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
              {RADIUS_OPTIONS.map((option) => (
                <div
                  key={option}
                  className={`px-4 py-2 cursor-pointer hover:bg-blue-50 transition-colors ${
                    radius === option ? 'bg-blue-100' : ''
                  }`}
                  onClick={() => handleRadiusSelect(option)}
                >
                  {option === -1 ? '> 25 miles' : `${option} miles`}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Current Location Display */}
      {zipcode && currentArea && (
        <div className="flex items-center text-sm text-gray-600">
          <FaMapMarkerAlt className="mr-1 text-red-500" />
          <span>{currentArea.area}</span>
        </div>
      )}
    </div>
  );
};

export default LocationSelector;

