import React, { useState, useMemo, useEffect } from 'react';
import CoachCourseDetailsModal from './CoachCourseDetailsModal';
import { 
  FaPlus, 
  FaSearch, 
  FaEye, 
  FaEdit, 
  FaVideo, 
  FaTrash, 
  FaStar,
  FaTimes
} from 'react-icons/fa';
import CreateCourseForm from './CreateCourseForm';
import axiosInstance from '../../api/axiosInstance';
import { showErrorToast } from '../../components/Toast';

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  sessions: number;
  sessionDuration: number;
  bufferTime: number;
}

interface DaySchedule {
  day: string;
  isActive: boolean;
  timeSlots: TimeSlot[];
}

interface Course {
  id: string | number;
  title: string;
  thumbnail: string;
  students: number;
  rating: number;
  price: number;
  status: string;
  category: string;
  duration: string;
  lessons: number;
  weeklySchedule?: DaySchedule[];
  videoThumbnail?: string;
  hasVideo?: boolean;
}

interface CoursesProps {
  courses: Course[];
}

// ThumbnailWithFallback component
function ThumbnailWithFallback({ thumbnail, title, generateTextThumbnail }) {
  const [imgError, setImgError] = React.useState(false);
  if (!thumbnail || thumbnail === "" || imgError) {
    return (
      <img
        src={generateTextThumbnail(title)}
        alt={title}
        className="w-full h-44 sm:h-48 object-cover"
      />
    );
  }
  return (
    <img
      src={thumbnail}
      alt={title}
      className="w-full h-44 sm:h-48 object-cover"
      onError={() => setImgError(true)}
    />
  );
}

const Courses: React.FC<CoursesProps> = ({ courses }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [localCourses, setLocalCourses] = useState<Course[]>(courses);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | number | null>(null);
  
  // Filter states - simplified
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedDay, setSelectedDay] = useState<string>('All Days');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Filtered courses with search functionality
  const filteredCourses = useMemo(() => {
    return localCourses.filter(course => {
      // Status filter
      if (selectedStatus !== 'All') {
        const normalizedStatus = course.status?.toLowerCase();
        if (
          (selectedStatus === 'Approved' && normalizedStatus !== 'active' && normalizedStatus !== 'approved') ||
          (selectedStatus === 'Pending' && normalizedStatus !== 'pending') ||
          (selectedStatus === 'Rejected' && normalizedStatus !== 'rejected')
        ) {
          return false;
        }
      }
      
      // Day filter
      if (selectedDay !== 'All Days') {
        const hasScheduleForDay = course.weeklySchedule?.some(daySchedule => 
          daySchedule.isActive && 
          daySchedule.day.toLowerCase().includes(selectedDay.toLowerCase()) &&
          daySchedule.timeSlots.length > 0
        );
        if (!hasScheduleForDay) {
          return false;
        }
      }
      
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          course.title.toLowerCase().includes(query) ||
          course.category.toLowerCase().includes(query) ||
          course.status.toLowerCase().includes(query)
        );
      }
      
      return true;
    });
  }, [localCourses, selectedStatus, selectedDay, searchQuery]);

  // Sync local courses when parent prop changes (API updates)
  useEffect(() => {
    setLocalCourses(courses || []);
  }, [courses]);

  // Load shared courses from localStorage on component mount
  useEffect(() => {
    const sharedCourses = JSON.parse(localStorage.getItem('sharedCourses') || '[]');
    if (sharedCourses.length > 0) {
      setLocalCourses(prev => {
        // Merge shared courses with existing courses, avoiding duplicates
        const existingIds = new Set(prev.map(course => course.id));
        const newSharedCourses = sharedCourses.filter((course: Course) => !existingIds.has(course.id));
        return [...newSharedCourses, ...prev];
      });
    }
  }, []);

  // Function to generate modern text-based thumbnail
  const generateTextThumbnail = (title: string) => {
    // Generate gradient colors based on title
    const gradients = [
      { from: '#6366f1', to: '#8b5cf6' }, // Indigo to Purple
      { from: '#3b82f6', to: '#06b6d4' }, // Blue to Cyan
      { from: '#10b981', to: '#059669' }, // Green to Emerald
      { from: '#f97316', to: '#dc2626' }, // Orange to Red
      { from: '#ec4899', to: '#e11d48' }, // Pink to Rose
      { from: '#eab308', to: '#ea580c' }, // Yellow to Orange
      { from: '#14b8a6', to: '#2563eb' }, // Teal to Blue
      { from: '#8b5cf6', to: '#7c3aed' }  // Violet to Purple
    ];
    
    const gradientIndex = title.length % gradients.length;
    const gradient = gradients[gradientIndex];
    
    // Create SVG with modern design
    const svg = `
      <svg width="400" height="240" viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${gradient.from};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${gradient.to};stop-opacity:1" />
          </linearGradient>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000000" flood-opacity="0.1"/>
          </filter>
        </defs>
        
        <!-- Background -->
        <rect width="400" height="240" fill="url(#gradient)" rx="12"/>
        
        <!-- Decorative elements -->
        <circle cx="320" cy="60" r="40" fill="rgba(255,255,255,0.1)"/>
        <circle cx="80" cy="180" r="30" fill="rgba(255,255,255,0.1)"/>
        <circle cx="350" cy="200" r="20" fill="rgba(255,255,255,0.1)"/>
        
        <!-- Main text -->
        <text x="200" y="140" font-family="Inter, system-ui, sans-serif" font-size="32" font-weight="700" 
              text-anchor="middle" fill="white" filter="url(#shadow)">
          ${title}
        </text>
        
        <!-- Subtitle -->
        <text x="200" y="170" font-family="Inter, system-ui, sans-serif" font-size="14" font-weight="500" 
              text-anchor="middle" fill="rgba(255,255,255,0.8)">
          Course
        </text>
      </svg>
    `;
    
    // Convert SVG to data URL
    const svgBlob = new Blob([svg], { type: 'image/svg+xml' });
    return URL.createObjectURL(svgBlob);
  };

  // Helper function to format time display
  const formatTimeDisplay = (time: string) => {
    const [hour] = time.split(':');
    const hourNum = parseInt(hour);
    return hourNum === 0 ? '12:00 AM' : hourNum < 12 ? `${hourNum}:00 AM` : hourNum === 12 ? '12:00 PM' : `${hourNum - 12}:00 PM`;
  };

  const handleCreateCourse = async (courseData: any) => {
    // Build multipart form data per backend contract
    const formData = new FormData();
    formData.append('title', courseData.title);
    formData.append('description', courseData.description);
    formData.append('benefits', courseData.benefits);
    formData.append('category', courseData.category);
    formData.append('program', courseData.program);
    formData.append('credits', courseData.credits); // send as number
    formData.append('timezone', courseData.timezone);
    // Optional fields
    if (courseData.duration) {
      formData.append('duration', courseData.duration);
    }
    if (courseData.courseDuration) {
      formData.append('courseDuration', courseData.courseDuration);
    }
    formData.append('weeklySchedule', JSON.stringify(courseData.weeklySchedule || []));
    if (courseData.thumbnail instanceof File) {
      formData.append('thumbnail', courseData.thumbnail);
    }
    if (courseData.introVideo instanceof File) {
      formData.append('introVideo', courseData.introVideo);
    }

    const resp = await axiosInstance.post('/courses', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    const created = resp.data?.data || resp.data;
    // Update local list with server response
    // Only use 'active', 'pending', 'rejected' for status
    let statusLabel = 'pending';
    if (created.status && typeof created.status === 'string') {
      const s = created.status.toLowerCase();
      if (s === 'approved' || (created.isActive && s !== 'rejected')) statusLabel = 'active';
      else if (s === 'rejected') statusLabel = 'rejected';
      else statusLabel = 'pending';
    } else if (created.isActive) {
      statusLabel = 'active';
    }
    const newCourse: Course = {
      id: created.id,
      title: created.title,
      thumbnail: created.thumbnail || generateTextThumbnail(created.title),
      students: 0,
      rating: 0,
      price: Number(created.creditCost || courseData.credits || 0),
      status: statusLabel,
      category: created.category,
      duration: created.courseDuration || '—',
      lessons: 0,
      weeklySchedule: created.weeklySchedule || courseData.weeklySchedule,
      videoThumbnail: '',
      hasVideo: Boolean(created.videoUrl)
    };

    setLocalCourses(prev => [newCourse, ...prev]);
    setShowCreateForm(false);
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setShowEditForm(true);
  };

  const handleUpdateCourse = async (courseData: any) => {
    if (!editingCourse) return;

    const category = courseData.program.charAt(0).toUpperCase() + courseData.program.slice(1);
    
    // Update the course object with the form data
    const updatedCourse: Course = {
      ...editingCourse,
      title: courseData.title,
      thumbnail: courseData.thumbnail ? URL.createObjectURL(courseData.thumbnail) : editingCourse.thumbnail,
      price: courseData.credits,
      category: category,
      weeklySchedule: courseData.weeklySchedule
    };

    // Update the course in the local state
    setLocalCourses(prev => prev.map(course => 
      course.id === editingCourse.id ? updatedCourse : course
    ));
    
    setShowEditForm(false);
    setEditingCourse(null);
  };

  const handleAddVideo = (course: Course) => {
    // Create a hidden file input
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'video/*';
    fileInput.multiple = false;
    fileInput.style.display = 'none';
    
    fileInput.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // Validate file size (100MB limit)
        if (file.size > 100 * 1024 * 1024) {
          alert('Video file size must be less than 100MB');
          document.body.removeChild(fileInput);
          return;
        }
        
        // Validate file type
        const allowedTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/wmv', 'video/flv'];
        if (!allowedTypes.includes(file.type)) {
          alert('Please select a valid video file (MP4, MOV, AVI, WMV, FLV)');
          document.body.removeChild(fileInput);
          return;
        }
        
        // Handle video upload - you can add your video upload logic here
        console.log('Video uploaded for course:', course.title, file);
        
        // Create video thumbnail (you can replace this with actual video thumbnail generation)
        const videoThumbnail = generateTextThumbnail('Video');
        
        // Update the course object to reflect the new video
        setLocalCourses(prev => prev.map(c => 
          c.id === course.id ? { 
            ...c, 
            hasVideo: true, 
            videoThumbnail: videoThumbnail 
          } : c
        ));
        
        // Show success message with better UX
        const successMessage = `✅ Video "${file.name}" uploaded successfully for course "${course.title}"`;
        alert(successMessage);
      }
      // Clean up
      document.body.removeChild(fileInput);
    };
    
    // Add to DOM and trigger click
    document.body.appendChild(fileInput);
    fileInput.click();
  };

  const handleDeleteCourse = (course: Course) => {
    if (window.confirm(`Are you sure you want to delete the course "${course.title}"? This action cannot be undone.`)) {
      setLocalCourses(prev => prev.filter(c => c.id !== course.id));
    }
  };

  const handleViewDetails = (courseId: string | number) => {
    console.log(`[Coach] Opening course details modal for course ID: ${courseId}`);
    setSelectedCourseId(courseId);
    setShowDetailsModal(true);
  };

  // Utility: pick a gradient based on course title for variety
  function getGradient(title: string) {
    const gradients = [
      "bg-gradient-to-r from-blue-500 to-purple-600",
      "bg-gradient-to-r from-green-400 to-emerald-500",
      "bg-gradient-to-r from-pink-500 to-yellow-500",
      "bg-gradient-to-r from-indigo-500 to-blue-400",
      "bg-gradient-to-r from-orange-400 to-red-500",
      "bg-gradient-to-r from-teal-400 to-cyan-500",
      "bg-gradient-to-r from-fuchsia-500 to-pink-500"
    ];
    let hash = 0;
    for (let i = 0; i < title.length; i++) {
      hash = title.charCodeAt(i) + ((hash << 5) - hash);
    }
    const idx = Math.abs(hash) % gradients.length;
    return gradients[idx];
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">My Courses</h2>
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">Manage and track your course performance</p>
        </div>
        <button 
          onClick={() => setShowCreateForm(true)}
          className="flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 text-sm sm:text-base font-medium"
        >
          <FaPlus className="text-sm sm:text-base" />
          <span className="hidden sm:inline">Create New Course</span>
          <span className="sm:hidden">Create Course</span>
        </button>
      </div>

      {/* Search and Filters - Professional Layout */}
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
        
        {/* Search Bar Row */}
        <div className="mb-4">
          <div className="relative max-w-md">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes className="text-sm" />
              </button>
            )}
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          
          {/* Status Filter Section */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">Status:</label>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'All', label: 'All', count: localCourses.length },
                { key: 'Approved', label: 'Approved', count: localCourses.filter(c => c.status === 'active' || c.status === 'approved').length },
                { key: 'Pending', label: 'Pending', count: localCourses.filter(c => c.status === 'pending').length },
                { key: 'Rejected', label: 'Rejected', count: localCourses.filter(c => c.status === 'rejected').length }
              ].map((status) => (
                <button
                  key={status.key}
                  onClick={() => setSelectedStatus(status.key)}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    selectedStatus === status.key
                      ? status.key === 'All' ? 'bg-indigo-500 text-white shadow-sm' :
                        status.key === 'Approved' ? 'bg-green-500 text-white shadow-sm' :
                        status.key === 'Pending' ? 'bg-orange-500 text-white shadow-sm' :
                        'bg-red-500 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                  }`}
                >
                  <span>{status.label}</span>
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
                    selectedStatus === status.key ? 'bg-white/20 text-white' : 'bg-white text-gray-700'
                  }`}>
                    {status.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Day Filter Section */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">Schedule Day:</label>
            <div className="relative min-w-[180px]">
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-10 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer transition-colors"
              >
                <option value="All Days">
                  All Days ({localCourses.filter(c => c.weeklySchedule?.some(d => d.isActive && d.timeSlots.length > 0)).length})
                </option>
                {[
                  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
                ].map((day) => {
                  const dayCount = localCourses.filter(c => 
                    c.weeklySchedule?.some(d => 
                      d.isActive && 
                      d.day.toLowerCase().includes(day.toLowerCase()) && 
                      d.timeSlots.length > 0
                    )
                  ).length;
                  
                  return (
                    <option key={day} value={day}>
                      {day} ({dayCount})
                    </option>
                  );
                })}
              </select>
              {/* Custom dropdown arrow */}
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        {(searchQuery || selectedStatus !== 'All' || selectedDay !== 'All Days') && (
          <div className="mt-4 pt-4 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{filteredCourses.length}</span> of <span className="font-medium">{localCourses.length}</span> courses
              {searchQuery && (
                <span> matching "<span className="font-medium text-indigo-600">{searchQuery}</span>"</span>
              )}
              {selectedDay !== 'All Days' && (
                <span> scheduled on <span className="font-medium text-blue-600">{selectedDay}</span></span>
              )}
              {selectedStatus !== 'All' && (
                <span> with <span className="font-medium text-gray-800">{selectedStatus.toLowerCase()}</span> status</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                >
                  Clear search
                </button>
              )}
              {(selectedStatus !== 'All' || selectedDay !== 'All Days') && (
                <button
                  onClick={() => {
                    setSelectedStatus('All');
                    setSelectedDay('All Days');
                  }}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                >
                  Reset filters
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {filteredCourses.map((course) => (
          <div 
            key={course.id} 
            className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:border-blue-200 transition-all duration-300 cursor-pointer"
            onDoubleClick={() => handleViewDetails(course.id)}
            title="Double-click to view details"
          >
            <div className="relative overflow-hidden">
              {/* Thumbnail or Fallback with error handling */}
              <ThumbnailWithFallback 
                thumbnail={course.thumbnail} 
                title={course.title} 
                generateTextThumbnail={generateTextThumbnail} 
              />
              
              {/* Status Badge */}
              <div className="absolute top-2 right-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                  course.status === 'active' || course.status === 'approved' ? 'bg-green-500 text-white' :
                  course.status === 'pending' ? 'bg-orange-500 text-white' :
                  course.status === 'rejected' ? 'bg-red-500 text-white' : 
                  'bg-gray-500 text-white'
                }`}>
                  {course.status === 'active' ? 'Approved' : 
                   course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                </span>
              </div>
              
              {/* Price Badge */}
              <div className="absolute bottom-2 left-2">
                <span className="bg-black/80 text-white px-2 py-1 rounded-md text-xs font-semibold">
                  ${course.price}
                </span>
              </div>

              {/* Duration Badge */}
              <div className="absolute bottom-2 right-2">
                <span className="bg-blue-500/90 text-white px-2 py-1 rounded-md text-xs font-semibold">
                  {course.duration || '12 weeks'}
                </span>
              </div>
            </div>
            
            <div className="p-4">
              {/* Course Header */}
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-900 line-clamp-2 flex-1 mr-2 group-hover:text-blue-600 transition-colors">
                  {course.title}
                </h3>
                <div className="flex items-center space-x-1 text-yellow-500 flex-shrink-0">
                  <FaStar className="text-xs" />
                  <span className="text-xs font-semibold">{course.rating}</span>
                </div>
              </div>
              
              {/* Category */}
              <div className="mb-3">
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-700">
                  {course.category}
                </span>
              </div>
              
              {/* Schedule Information - Compact */}
              {course.weeklySchedule && course.weeklySchedule.some(day => day.isActive) && (
                <div className="mb-3 p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1">
                      <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium text-gray-700">Schedule</span>
                    </div>
                    <span className="text-gray-500">
                      {course.weeklySchedule.filter(day => day.isActive).length} days/week
                    </span>
                  </div>
                  {/* Show first active day time */}
                  {course.weeklySchedule
                    .filter(day => day.isActive && day.timeSlots.length > 0)
                    .slice(0, 1)
                    .map((day, index) => (
                      <div key={day.day} className="mt-1 text-xs text-gray-600">
                        <span className="font-medium">{day.day.slice(0, 3)}</span>: {formatTimeDisplay(day.timeSlots[0].startTime)}
                        {day.timeSlots.length > 1 && <span className="text-gray-400"> +{day.timeSlots.length - 1}</span>}
                      </div>
                    ))}
                </div>
              )}

              {/* Video Indicator - Compact */}
              {course.hasVideo && course.videoThumbnail && (
                <div className="mb-3 flex items-center space-x-2 text-xs text-green-600">
                  <FaVideo className="w-3 h-3" />
                  <span className="font-medium">Video Available</span>
                </div>
              )}

              {/* Action Buttons - Compact */}
              <div className="flex items-center gap-2">
                {/* Primary Action - View with different design */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewDetails(course.id);
                  }}
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white py-2.5 px-3 rounded-lg font-medium text-xs transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center space-x-1"
                  title="View course details"
                >
                  <FaEye className="text-xs" />
                  <span>Details</span>
                </button>

                {/* Secondary Actions - More compact */}
                <div className="flex items-center gap-1">
                  {/* Edit Button */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditCourse(course);
                    }}
                    className="w-9 h-9 bg-gray-100 hover:bg-indigo-100 text-gray-600 hover:text-indigo-600 rounded-lg transition-all duration-200 flex items-center justify-center"
                    title="Edit course"
                  >
                    <FaEdit className="text-xs" />
                  </button>

                  {/* Add Video Button */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddVideo(course);
                    }}
                    className="w-9 h-9 bg-gray-100 hover:bg-green-100 text-gray-600 hover:text-green-600 rounded-lg transition-all duration-200 flex items-center justify-center"
                    title="Add video to course"
                  >
                    <FaVideo className="text-xs" />
                  </button>

                  {/* Delete Button */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCourse(course);
                    }}
                    className="w-9 h-9 bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-600 rounded-lg transition-all duration-200 flex items-center justify-center"
                    title="Delete course"
                  >
                    <FaTrash className="text-xs" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Courses Found State */}
      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-gray-50 rounded-xl p-8 border-2 border-dashed border-gray-300 max-w-md mx-auto">
            <FaSearch className="text-4xl text-gray-400 mb-4 mx-auto" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              {searchQuery ? 'No courses found' : 
               selectedDay !== 'All Days' ? `No courses scheduled on ${selectedDay}` :
               'No courses match the selected filters'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchQuery 
                ? `No courses found for "${searchQuery}". Try adjusting your search terms.`
                : selectedDay !== 'All Days'
                  ? `No courses are scheduled on ${selectedDay}. Try selecting a different day or create a course with ${selectedDay} schedule.`
                  : selectedStatus === 'All' 
                    ? 'You haven\'t created any courses yet. Click "Create New Course" to get started.'
                    : `No courses with "${selectedStatus}" status found.`
              }
            </p>
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Clear Search
              </button>
            ) : (selectedStatus !== 'All' || selectedDay !== 'All Days') ? (
              <button
                onClick={() => {
                  setSelectedStatus('All');
                  setSelectedDay('All Days');
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Clear All Filters
              </button>
            ) : (
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Create Your First Course
              </button>
            )}
          </div>
        </div>
      )}

      {/* Create Course Form Modal */}
      {showCreateForm && (
        <CreateCourseForm
          onClose={() => setShowCreateForm(false)}
          onSubmit={handleCreateCourse}
        />
      )}

      {/* Edit Course Form Modal */}
      {showEditForm && editingCourse && (
        <CreateCourseForm
          onClose={() => {
            setShowEditForm(false);
            setEditingCourse(null);
          }}
          onSubmit={handleUpdateCourse}
          initialData={{
            title: editingCourse.title,
            description: editingCourse.title, // You might want to add description to Course interface
            benefits: '', // You might want to add benefits to Course interface
            category: editingCourse.category.toLowerCase().replace(' ', '-'),
            program: 'morning' as const, // Default to morning since we don't store this in Course
            credits: editingCourse.price,
            timezone: '',
            weeklySchedule: editingCourse.weeklySchedule || [
              { day: 'SUNDAYS', isActive: false, timeSlots: [] },
              { day: 'MONDAYS', isActive: false, timeSlots: [] },
              { day: 'TUESDAYS', isActive: false, timeSlots: [] },
              { day: 'WEDNESDAYS', isActive: false, timeSlots: [] },
              { day: 'THURSDAYS', isActive: false, timeSlots: [] },
              { day: 'FRIDAYS', isActive: false, timeSlots: [] },
              { day: 'SATURDAYS', isActive: false, timeSlots: [] }
            ]
          }}
          isEditing={true}
        />
      )}

      {/* Coach Course Details Modal */}
      <CoachCourseDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedCourseId(null);
        }}
        courseId={selectedCourseId}
        onEdit={(courseId) => {
          const course = localCourses.find(c => c.id === courseId);
          if (course) {
            handleEditCourse(course);
          }
        }}
      />


    </div>
  );
};

export default Courses;