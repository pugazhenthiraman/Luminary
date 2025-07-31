import React, { useState, useEffect } from 'react';
import { format, parse, addMinutes, setHours, setMinutes } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import TimezoneSelect from 'react-timezone-select';
import { 
  FaClock, 
  FaGlobe, 
  FaCalendarAlt, 
  FaCheck, 
  FaTimes,
  FaPlus,
  FaTrash,
  FaEdit,
  FaSave,
  FaEye,
  FaEyeSlash
} from 'react-icons/fa';

interface TimeSlot {
  id: string;
  time: string; // 24-hour format for storage
  displayTime: string; // 12-hour format for display
  day?: string;
  date?: string;
  timezone: string;
}

interface TimeSlotSelectorProps {
  value: TimeSlot[];
  onChange: (timeSlots: TimeSlot[]) => void;
  showDates?: boolean;
  multipleSelection?: boolean;
  className?: string;
}

const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({
  value = [],
  onChange,
  showDates = false,
  multipleSelection = true,
  className = ''
}) => {
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<TimeSlot[]>(value);
  const [timezone, setTimezone] = useState<string>('');
  const [showDateToggle, setShowDateToggle] = useState(showDates);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [showCustomTimeForm, setShowCustomTimeForm] = useState(false);
  const [customTime, setCustomTime] = useState({ hour: '9', minute: '00', period: 'AM' });
  const [showPreview, setShowPreview] = useState(false);

  // Get current timezone on component mount
  useEffect(() => {
    const currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setTimezone(currentTimezone);
  }, []);

  // Update parent component when selections change
  useEffect(() => {
    onChange(selectedTimeSlots);
  }, [selectedTimeSlots, onChange]);

  // Convert 24-hour to 12-hour format
  const formatTo12Hour = (time24: string): string => {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${period}`;
  };

  // Convert 12-hour to 24-hour format
  const formatTo24Hour = (hour: string, minute: string, period: string): string => {
    let hour24 = parseInt(hour);
    if (period === 'PM' && hour24 !== 12) hour24 += 12;
    if (period === 'AM' && hour24 === 12) hour24 = 0;
    return `${hour24.toString().padStart(2, '0')}:${minute}`;
  };

  // Generate time slots from 6 AM to 11 PM
  const generateTimeSlots = () => {
    const slots: Array<{ time24: string; displayTime: string }> = [];
    for (let hour = 6; hour <= 23; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time24 = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push({
          time24,
          displayTime: formatTo12Hour(time24)
        });
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const handleTimeSlotToggle = (time24: string, day?: string, date?: string) => {
    const slotId = `${time24}-${day || ''}-${date || ''}`;
    const existingSlot = selectedTimeSlots.find(slot => slot.id === slotId);

    if (existingSlot) {
      // Remove slot
      setSelectedTimeSlots(prev => prev.filter(slot => slot.id !== slotId));
    } else {
      // Add slot
      const newSlot: TimeSlot = {
        id: slotId,
        time: time24,
        displayTime: formatTo12Hour(time24),
        day,
        date,
        timezone
      };

      if (multipleSelection) {
        setSelectedTimeSlots(prev => [...prev, newSlot]);
      } else {
        setSelectedTimeSlots([newSlot]);
      }
    }
  };

  const handleRemoveSlot = (slotId: string) => {
    setSelectedTimeSlots(prev => prev.filter(slot => slot.id !== slotId));
  };

  const handleAddCustomTime = () => {
    const time24 = formatTo24Hour(customTime.hour, customTime.minute, customTime.period);
    const slotId = `custom-${Date.now()}`;
    
    const newSlot: TimeSlot = {
      id: slotId,
      time: time24,
      displayTime: `${customTime.hour}:${customTime.minute} ${customTime.period}`,
      day: showDateToggle && selectedDate ? getDayName(selectedDate) : undefined,
      date: showDateToggle && selectedDate ? selectedDate : undefined,
      timezone
    };

    setSelectedTimeSlots(prev => [...prev, newSlot]);
    setShowCustomTimeForm(false);
    setCustomTime({ hour: '9', minute: '00', period: 'AM' });
  };

  const getCurrentDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const getDayName = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
  };

  const isSlotSelected = (time24: string, day?: string, date?: string) => {
    const slotId = `${time24}-${day || ''}-${date || ''}`;
    return selectedTimeSlots.some(slot => slot.id === slotId);
  };

  const getTimezonePreview = () => {
    if (!timezone || selectedTimeSlots.length === 0) return null;

    const previewSlots = selectedTimeSlots.slice(0, 3).map(slot => {
      // Create a simple timezone offset display
      const timezoneOffset = getTimezoneOffset(timezone);
      const offsetHours = Math.abs(Math.floor(timezoneOffset / 60));
      const offsetMinutes = Math.abs(timezoneOffset % 60);
      const offsetSign = timezoneOffset >= 0 ? '+' : '-';
      const offsetString = `GMT${offsetSign}${offsetHours.toString().padStart(2, '0')}:${offsetMinutes.toString().padStart(2, '0')}`;
      
      return {
        ...slot,
        timezoneOffset: offsetString
      };
    });

    return previewSlots;
  };

  const getTimezoneOffset = (tz: string) => {
    try {
      const date = new Date();
      const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
      const targetTime = new Date(utc + (0 * 60000));
      const targetOffset = targetTime.toLocaleString('en-US', { timeZone: tz, timeZoneName: 'short' });
      
      // Extract offset from timezone string (this is a simplified approach)
      const offsetMatch = targetOffset.match(/GMT([+-]\d{2}:\d{2})/);
      if (offsetMatch) {
        const [hours, minutes] = offsetMatch[1].split(':');
        return parseInt(hours) * 60 + parseInt(minutes);
      }
      
      return 0;
    } catch {
      return 0;
    }
  };

  const previewSlots = getTimezonePreview();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Timezone Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <FaGlobe className="inline mr-2 text-indigo-500" />
          Timezone
        </label>
        <TimezoneSelect
          value={timezone}
          onChange={(tz) => setTimezone(tz.value)}
          className="w-full"
        />
      </div>

      {/* Date Toggle */}
      <div className="flex items-center justify-between">
        <label className="flex items-center text-sm font-medium text-gray-700">
          <FaCalendarAlt className="mr-2 text-indigo-500" />
          Include specific dates
        </label>
        <button
          type="button"
          onClick={() => setShowDateToggle(!showDateToggle)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
            showDateToggle ? 'bg-indigo-600' : 'bg-gray-200'
          }`}
          aria-label="Toggle date selection"
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
              showDateToggle ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Date Selection */}
      {showDateToggle && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Select Date
          </label>
          <ModernDatePicker
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            minDate={getCurrentDate()}
          />
        </div>
      )}

      {/* Time Slots Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">
            <FaClock className="inline mr-2 text-indigo-500" />
            Available Time Slots
          </label>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setShowCustomTimeForm(!showCustomTimeForm)}
              className="flex items-center space-x-1 text-sm text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-2 py-1 rounded-lg transition-colors duration-200"
            >
              <FaPlus className="text-xs" />
              <span>Custom Time</span>
            </button>
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-50 px-2 py-1 rounded-lg transition-colors duration-200"
            >
              {showPreview ? <FaEyeSlash className="text-xs" /> : <FaEye className="text-xs" />}
              <span>Preview</span>
            </button>
          </div>
        </div>

        {/* Custom Time Form */}
        {showCustomTimeForm && (
          <div className="mb-4 p-4 bg-indigo-50 rounded-xl border border-indigo-200">
            <div className="flex items-center space-x-3">
              <select
                value={customTime.hour}
                onChange={(e) => setCustomTime(prev => ({ ...prev, hour: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Select hour"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(hour => (
                  <option key={hour} value={hour}>{hour}</option>
                ))}
              </select>
              <span className="text-gray-600">:</span>
              <select
                value={customTime.minute}
                onChange={(e) => setCustomTime(prev => ({ ...prev, minute: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Select minute"
              >
                <option value="00">00</option>
                <option value="15">15</option>
                <option value="30">30</option>
                <option value="45">45</option>
              </select>
              <select
                value={customTime.period}
                onChange={(e) => setCustomTime(prev => ({ ...prev, period: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Select AM/PM"
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
              <button
                type="button"
                onClick={handleAddCustomTime}
                className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                aria-label="Save custom time"
              >
                <FaSave className="text-xs" />
              </button>
              <button
                type="button"
                onClick={() => setShowCustomTimeForm(false)}
                className="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                aria-label="Cancel custom time"
              >
                <FaTimes className="text-xs" />
              </button>
            </div>
          </div>
        )}

        {/* Time Slots Grid */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {timeSlots.map((slot) => (
              <button
                key={slot.time24}
                type="button"
                onClick={() => handleTimeSlotToggle(
                  slot.time24, 
                  showDateToggle && selectedDate ? getDayName(selectedDate) : undefined,
                  showDateToggle && selectedDate ? selectedDate : undefined
                )}
                className={`p-2 text-xs rounded-lg transition-all duration-200 ${
                  isSlotSelected(
                    slot.time24,
                    showDateToggle && selectedDate ? getDayName(selectedDate) : undefined,
                    showDateToggle && selectedDate ? selectedDate : undefined
                  )
                    ? 'bg-indigo-500 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 hover:shadow-sm'
                }`}
              >
                {slot.displayTime}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Timezone Preview */}
      {showPreview && previewSlots && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Timezone Preview
          </label>
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <p className="text-sm text-blue-800 mb-2">
              How your selected times appear in different timezones:
            </p>
            <div className="space-y-2">
              {previewSlots.map((slot) => (
                <div key={slot.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{slot.displayTime} ({timezone})</span>
                  <span className="text-blue-600">→ {slot.timezoneOffset}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Selected Time Slots */}
      {selectedTimeSlots.length > 0 && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Selected Time Slots ({selectedTimeSlots.length})
          </label>
          <div className="space-y-2">
            {selectedTimeSlots.map((slot) => (
              <div
                key={slot.id}
                className="flex items-center justify-between p-3 bg-indigo-50 border border-indigo-200 rounded-lg"
              >
                <div className="flex items-center space-x-2">
                  <FaCheck className="text-indigo-600 text-sm" />
                  <span className="text-sm font-medium text-gray-800">
                    {slot.displayTime}
                  </span>
                  {slot.day && (
                    <span className="text-xs text-gray-500">
                      ({slot.day})
                    </span>
                  )}
                  {slot.date && (
                    <span className="text-xs text-gray-500">
                      {new Date(slot.date).toLocaleDateString()}
                    </span>
                  )}
                  <span className="text-xs text-indigo-600 bg-indigo-100 px-2 py-1 rounded">
                    {timezone}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveSlot(slot.id)}
                  className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1 rounded transition-colors duration-200"
                  aria-label="Remove time slot"
                >
                  <FaTrash className="text-xs" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Selection Buttons */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Quick Selection
        </label>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Morning', times: ['08:00', '09:00', '10:00', '11:00'] },
            { label: 'Afternoon', times: ['12:00', '13:00', '14:00', '15:00', '16:00'] },
            { label: 'Evening', times: ['17:00', '18:00', '19:00', '20:00'] }
          ].map((period) => (
            <button
              key={period.label}
              type="button"
              onClick={() => {
                const newSlots = period.times.map(time24 => ({
                  id: `quick-${time24}-${Date.now()}`,
                  time: time24,
                  displayTime: formatTo12Hour(time24),
                  day: showDateToggle && selectedDate ? getDayName(selectedDate) : undefined,
                  date: showDateToggle && selectedDate ? selectedDate : undefined,
                  timezone
                }));
                setSelectedTimeSlots(prev => [...prev, ...newSlots]);
              }}
              className="px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-indigo-100 hover:text-indigo-700 transition-colors duration-200"
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Modern Date Picker Component
interface ModernDatePickerProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  minDate: string;
}

const ModernDatePicker: React.FC<ModernDatePickerProps> = ({
  selectedDate,
  onDateChange,
  minDate
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDateObj, setSelectedDateObj] = useState<Date | null>(
    selectedDate ? new Date(selectedDate) : null
  );

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDateObj(date);
    onDateChange(date.toISOString().split('T')[0]);
    setIsOpen(false);
  };

  const isDateDisabled = (date: Date) => {
    const minDateObj = new Date(minDate);
    return date < minDateObj;
  };

  const isDateSelected = (date: Date) => {
    if (!selectedDateObj) return false;
    return date.toDateString() === selectedDateObj.toDateString();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <div className="relative">
      {/* Date Input Display */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 bg-white hover:bg-gray-50 text-left flex items-center justify-between"
        aria-label="Open date picker"
      >
        <span className={selectedDate ? 'text-gray-900' : 'text-gray-500'}>
          {selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }) : 'Select a date'}
        </span>
        <FaCalendarAlt className="text-indigo-500" />
      </button>

      {/* Date Picker Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 p-3 w-80">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={goToPreviousMonth}
              className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
              aria-label="Previous month"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <h3 className="text-sm font-semibold text-gray-800">
              {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            
            <button
              type="button"
              onClick={goToNextMonth}
              className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
              aria-label="Next month"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-0.5 mb-2">
            {daysOfWeek.map((day) => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-0.5">
            {days.map((day, index) => (
              <div key={index} className="h-8">
                {day ? (
                  <button
                    type="button"
                    onClick={() => handleDateSelect(day)}
                    disabled={isDateDisabled(day)}
                    className={`w-full h-full rounded-md text-xs font-medium transition-all duration-200 flex items-center justify-center ${
                      isDateSelected(day)
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md transform scale-105'
                        : isToday(day)
                        ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                        : isDateDisabled(day)
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 hover:shadow-sm'
                    }`}
                    aria-label={`Select ${day.toLocaleDateString()}`}
                  >
                    {day.getDate()}
                  </button>
                ) : (
                  <div className="w-full h-full" />
                )}
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex space-x-1">
              <button
                type="button"
                onClick={() => {
                  const today = new Date();
                  if (!isDateDisabled(today)) {
                    handleDateSelect(today);
                  }
                }}
                className="flex-1 px-2 py-1.5 text-xs text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => {
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  if (!isDateDisabled(tomorrow)) {
                    handleDateSelect(tomorrow);
                  }
                }}
                className="flex-1 px-2 py-1.5 text-xs text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-2 py-1.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default TimeSlotSelector;
