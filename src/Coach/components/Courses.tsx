import React, { useState, useMemo, useEffect } from 'react';
import { 
  FaPlus, 
  FaSearch, 
  FaFilter, 
  FaSort, 
  FaEdit, 
  FaVideo, 
  FaTrash, 
  FaStar,
  FaTimes
} from 'react-icons/fa';
import CreateCourseForm from './CreateCourseForm';
import axiosInstance from '../../api/axiosInstance';

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
  id: number;
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

const Courses: React.FC<CoursesProps> = ({ courses }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [localCourses, setLocalCourses] = useState<Course[]>(courses);
  const [showFilterModal, setShowFilterModal] = useState(false);
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [selectedStatus, setSelectedStatus] = useState<string>('All Status');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('All Prices');
  const [selectedDateRange, setSelectedDateRange] = useState<string>('All Time');
  const [selectedRating, setSelectedRating] = useState<string>('All Ratings');
  
  // Filtered courses
  const filteredCourses = useMemo(() => {
    return localCourses.filter(course => {
      // Category filter
      if (selectedCategory !== 'All Categories' && course.category !== selectedCategory) {
        return false;
      }
      
      // Status filter
      if (selectedStatus !== 'All Status' && course.status !== selectedStatus) {
        return false;
      }
      
      // Price range filter
      if (selectedPriceRange !== 'All Prices') {
        const coursePrice = course.price || 0;
        switch (selectedPriceRange) {
          case 'Free':
            if (coursePrice !== 0) return false;
            break;
          case '$0 - $50':
            if (coursePrice < 0 || coursePrice > 50) return false;
            break;
          case '$50 - $100':
            if (coursePrice < 50 || coursePrice > 100) return false;
            break;
          case '$100 - $200':
            if (coursePrice < 100 || coursePrice > 200) return false;
            break;
          case '$200+':
            if (coursePrice < 200) return false;
            break;
        }
      }
      
      // Rating filter
      if (selectedRating !== 'All Ratings') {
        const courseRating = course.rating || 0;
        switch (selectedRating) {
          case '4+ Stars':
            if (courseRating < 4) return false;
            break;
          case '3+ Stars':
            if (courseRating < 3) return false;
            break;
          case '2+ Stars':
            if (courseRating < 2) return false;
            break;
          case '1+ Star':
            if (courseRating < 1) return false;
            break;
        }
      }
      
      return true;
    });
  }, [localCourses, selectedCategory, selectedStatus, selectedPriceRange, selectedRating]);

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
    formData.append('credits', String(courseData.credits));
    formData.append('timezone', courseData.timezone);
    // Optional fields
    formData.append('courseDuration', '12 weeks');
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
    const newCourse: Course = {
      id: created.id,
      title: created.title,
      thumbnail: created.thumbnail || generateTextThumbnail(created.title),
      students: 0,
      rating: 0,
      price: Number(created.creditCost || courseData.credits || 0),
      status: created.isActive ? 'active' : 'inactive',
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

      {/* Search and Quick Filters */}
      <div className="bg-white rounded-xl p-3 sm:p-4 lg:p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
          {/* Search Bar */}
          <div className="relative flex-1 sm:flex-none sm:w-80 lg:w-96">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm sm:text-base" />
            <input
              type="text"
              placeholder="Search your courses..."
              className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>
          
          {/* Filter and Sort Buttons */}
          <div className="flex items-center justify-center sm:justify-end space-x-2">
            <button 
              onClick={() => setShowFilterModal(true)}
              className="flex items-center space-x-2 px-3 py-2 sm:px-4 sm:py-3 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-all duration-200 text-sm sm:text-base font-medium border border-indigo-200 hover:border-indigo-300"
              title="Open advanced filters"
            >
              <FaFilter className="text-sm sm:text-base" />
              <span className="hidden sm:inline">Advanced Filters</span>
              <span className="sm:hidden">Filters</span>
              {((selectedCategory !== 'All Categories') || 
                (selectedStatus !== 'All Status') || 
                (selectedPriceRange !== 'All Prices') || 
                (selectedDateRange !== 'All Time') || 
                (selectedRating !== 'All Ratings')) && (
                <span className="ml-1 px-2 py-0.5 bg-indigo-600 text-white text-xs rounded-full">
                  {[selectedCategory, selectedStatus, selectedPriceRange, selectedDateRange, selectedRating]
                    .filter(item => !item.includes('All')).length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
        {filteredCourses.map((course) => (
          <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200 animate-in slide-in-from-bottom duration-500">
            <div className="relative">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-32 sm:h-40 lg:h-48 object-cover"
              />
              <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  course.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {course.status}
                </span>
              </div>
              <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3">
                <span className="bg-black/70 text-white px-2 py-1 rounded text-xs">
                  ${course.price}
                </span>
              </div>
            </div>
            
            <div className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-start justify-between mb-2 sm:mb-3">
                <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800 line-clamp-2 flex-1 mr-2">{course.title}</h3>
                <div className="flex items-center space-x-1 text-yellow-500 flex-shrink-0">
                  <FaStar className="text-xs sm:text-sm" />
                  <span className="text-xs sm:text-sm font-medium">{course.rating}</span>
                </div>
              </div>
              
              <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
                <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600">
                  <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
                    {course.category}
                  </span>
                </div>
                
                {/* Schedule Information */}
                {course.weeklySchedule && course.weeklySchedule.some(day => day.isActive) && (
                  <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-100">
                    <div className="flex items-center space-x-2 mb-2">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-xs font-medium text-gray-700">Schedule</span>
                    </div>
                    <div className="space-y-1">
                      {course.weeklySchedule
                        .filter(day => day.isActive && day.timeSlots.length > 0)
                        .slice(0, 2) // Show only first 2 active days on mobile
                        .map((day, index) => (
                          <div key={day.day} className="flex items-center justify-between text-xs text-gray-600">
                            <span className="font-medium truncate">{day.day}</span>
                            <div className="flex items-center space-x-1 ml-2">
                              {day.timeSlots.slice(0, 1).map((slot, slotIndex) => (
                                <span key={slotIndex} className="bg-gray-100 px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs truncate">
                                  {formatTimeDisplay(slot.startTime)}
                                </span>
                              ))}
                              {day.timeSlots.length > 1 && (
                                <span className="text-gray-400 text-xs">+{day.timeSlots.length - 1}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      {course.weeklySchedule.filter(day => day.isActive && day.timeSlots.length > 0).length > 2 && (
                        <div className="text-xs text-gray-400 text-center pt-1">
                          +{course.weeklySchedule.filter(day => day.isActive && day.timeSlots.length > 0).length - 2} more days
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Video Thumbnail */}
                {course.hasVideo && course.videoThumbnail && (
                  <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-100">
                    <div className="flex items-center space-x-2 mb-2">
                      <FaVideo className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                      <span className="text-xs font-medium text-gray-700">Course Video</span>
                    </div>
                    <div className="relative">
                      <img
                        src={course.videoThumbnail}
                        alt="Course video thumbnail"
                        className="w-full h-16 sm:h-20 lg:h-24 object-cover rounded-lg border border-gray-200"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-20 rounded-lg flex items-center justify-center">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                          <FaVideo className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => handleEditCourse(course)}
                  className="flex-1 flex items-center justify-center space-x-2 bg-indigo-50 text-indigo-600 py-2 px-3 rounded-lg hover:bg-indigo-100 transition-colors duration-200 text-xs sm:text-sm font-medium"
                  title="Edit course"
                >
                  <FaEdit className="text-xs sm:text-sm" />
                  <span className="hidden sm:inline">Edit</span>
                </button>
                <button 
                  onClick={() => handleAddVideo(course)}
                  className="flex-1 flex items-center justify-center space-x-2 bg-green-50 text-green-600 py-2 px-3 rounded-lg hover:bg-green-100 transition-colors duration-200 text-xs sm:text-sm font-medium"
                  title="Add video to course"
                >
                  <FaVideo className="text-xs sm:text-sm" />
                  <span className="hidden sm:inline">Add Video</span>
                  <span className="sm:hidden">Video</span>
                </button>
                <button 
                  onClick={() => handleDeleteCourse(course)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  title="Delete course"
                >
                  <FaTrash className="text-xs sm:text-sm" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

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

      {/* Advanced Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-2 sm:p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[95vh] flex flex-col">
            {/* Header */}
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <FaFilter className="text-indigo-600 text-sm sm:text-lg" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">Advanced Filters</h3>
                    <p className="text-xs sm:text-sm text-gray-600">Filter your courses by multiple criteria</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 flex items-center justify-center"
                  title="Close filter modal"
                  aria-label="Close filter modal"
                >
                  <FaTimes className="text-sm sm:text-lg" />
                </button>
              </div>
            </div>

            {/* Filter Content */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">Category</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {['All Categories', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'English', 'History', 'Academic Enrichment', 'Creative Arts', 'Life Skills', 'Performing Arts', 'Sports & Physical', 'Technology & STEM', 'Mindfulness & Wellbeing', 'Languages & Communication'].map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3 py-2 text-sm border rounded-lg transition-all duration-200 text-left ${
                        selectedCategory === category
                          ? 'border-indigo-500 bg-indigo-100 text-indigo-700'
                          : 'border-gray-300 hover:border-indigo-500 hover:bg-indigo-50'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">Status</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {['All Status', 'Active', 'Draft', 'Archived', 'Pending Review'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setSelectedStatus(status)}
                      className={`px-3 py-2 text-sm border rounded-lg transition-all duration-200 text-left ${
                        selectedStatus === status
                          ? 'border-indigo-500 bg-indigo-100 text-indigo-700'
                          : 'border-gray-300 hover:border-indigo-500 hover:bg-indigo-50'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">Price Range</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {['All Prices', 'Free', '$0 - $50', '$50 - $100', '$100 - $200', '$200+'].map((price) => (
                    <button
                      key={price}
                      onClick={() => setSelectedPriceRange(price)}
                      className={`px-3 py-2 text-sm border rounded-lg transition-all duration-200 text-left ${
                        selectedPriceRange === price
                          ? 'border-indigo-500 bg-indigo-100 text-indigo-700'
                          : 'border-gray-300 hover:border-indigo-500 hover:bg-indigo-50'
                      }`}
                    >
                      {price}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">Created Date</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {['All Time', 'Last 7 days', 'Last 30 days', 'Last 3 months', 'Last 6 months', 'Last year'].map((date) => (
                    <button
                      key={date}
                      onClick={() => setSelectedDateRange(date)}
                      className={`px-3 py-2 text-sm border rounded-lg transition-all duration-200 text-left ${
                        selectedDateRange === date
                          ? 'border-indigo-500 bg-indigo-100 text-indigo-700'
                          : 'border-gray-300 hover:border-indigo-500 hover:bg-indigo-50'
                      }`}
                    >
                      {date}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">Rating</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {['All Ratings', '4+ Stars', '3+ Stars', '2+ Stars', '1+ Star'].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setSelectedRating(rating)}
                      className={`px-3 py-2 text-sm border rounded-lg transition-all duration-200 text-left ${
                        selectedRating === rating
                          ? 'border-indigo-500 bg-indigo-100 text-indigo-700'
                          : 'border-gray-300 hover:border-indigo-500 hover:bg-indigo-50'
                      }`}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 sm:px-6 py-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
              <div className="flex items-center justify-between space-x-2">
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="flex-1 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200 font-medium text-xs sm:text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setSelectedCategory('All Categories');
                    setSelectedStatus('All Status');
                    setSelectedPriceRange('All Prices');
                    setSelectedDateRange('All Time');
                    setSelectedRating('All Ratings');
                  }}
                  className="flex-1 px-3 py-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100 rounded-lg transition-all duration-200 font-medium text-xs sm:text-sm"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="flex-1 px-3 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-all duration-200 font-medium text-xs sm:text-sm"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default Courses; 